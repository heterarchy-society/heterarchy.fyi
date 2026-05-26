import { error } from '@sveltejs/kit';
import glossaryData from '$lib/data/glossary.json';
import writingsData from '$lib/data/writings.json';
import { datasetConfigs } from '$lib/data/datasets';

const writingsRepository = datasetConfigs.find((d) => d.id === 'writings')!.repository;
import { renderMarkdown } from '$lib/server/markdown';
import { processWikilinks, type GlossarySlugMap } from '$lib/wikilinks';
import { getLocale } from '$lib/paraglide/runtime';
import type { Locale } from '$lib/locale-storage';
import type { Writing } from '../+page';
import type { PageServerLoad } from './$types';

type WritingSource = Writing['sources'][number];

type GlossaryTerm = {
	id: string;
	name: string;
	type?: string;
	translations?: Record<string, { slug?: string; name?: string }>;
};

const glossary = (glossaryData as { terms: GlossaryTerm[] }).terms;
const glossaryById = new Map(glossary.map((t) => [t.id, t]));

function buildSlugMap(locale: string): GlossarySlugMap {
	const map: GlossarySlugMap = {};
	for (const term of glossary) {
		const slug = term.translations?.[locale]?.slug ?? term.id;
		map[term.id] = slug;
		map[term.name.toLowerCase()] = slug;
		map[term.name.toLowerCase().replace(/\s+/g, '-')] = slug;
	}
	return map;
}

const viewableFormats = new Set(['md', 'html', 'txt', 'pdf']);
const downloadableFormats = new Set(['md', 'html', 'txt', 'pdf', 'typst', 'typ']);
const formatOrder = new Map([
	['md', 0], ['html', 1], ['txt', 2], ['pdf', 3], ['typst', 4], ['typ', 4],
]);

function sortSources(sources: WritingSource[]): WritingSource[] {
	return [...sources].sort((a, b) =>
		(formatOrder.get(a.format) ?? 99) - (formatOrder.get(b.format) ?? 99)
		|| (a.variant ?? '').localeCompare(b.variant ?? '')
		|| a.path.localeCompare(b.path)
	);
}

function sourceKey(source: WritingSource, sources: WritingSource[]): string {
	const duplicates = sources.filter((s) => s.format === source.format);
	if (duplicates.length <= 1) return source.format;
	return source.variant ? `${source.format}-${source.variant}` : source.path.replace(/\.[^.]+$/, '');
}

function sourceUrl(id: string, source: WritingSource): string {
	return `https://writings.data.heterarchy.fyi/writings/${id}/${source.path}`;
}

function findSource(sources: WritingSource[], requested: string | null): WritingSource | null {
	const readable = sortSources(sources.filter((s) => viewableFormats.has(s.format)));
	if (readable.length === 0) return sources[0] ?? null;
	if (requested) {
		const normalized = requested.toLowerCase();
		const match = readable.find((s) =>
			sourceKey(s, readable) === normalized || s.format === normalized || s.variant === normalized || s.path === requested
		);
		if (match) return match;
	}
	return readable.find((s) => s.format === 'md')
		?? readable.find((s) => s.format === 'html')
		?? readable.find((s) => s.format === 'txt')
		?? readable.find((s) => s.format === 'pdf')
		?? readable[0];
}

export function entries() {
	return (writingsData as { writings: { id: string }[] }).writings.map((w) => ({ id: w.id }));
}

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	try {
		const res = await fetch(`https://writings.data.heterarchy.fyi/writings/${params.id}.json`);
		if (!res.ok) error(404, 'Writing not found');
		const writing: Writing = await res.json();

		const locale = getLocale() as Locale;
		const slugMap = buildSlugMap(locale);
		const allSources = writing.sources ?? [];
		const viewableSources = sortSources(allSources.filter((s) => viewableFormats.has(s.format)));
		const downloadSources = sortSources(allSources.filter((s) => downloadableFormats.has(s.format)));

		const glossaryTerms = (writing.glossary ?? [])
			.map((id) => glossaryById.get(id))
			.filter((t): t is GlossaryTerm => Boolean(t));

		const descriptionHtml = writing.description
			? processWikilinks(writing.description, locale, slugMap)
			: null;

		let requestedFormat: string | null = null;
		try { requestedFormat = url.searchParams.get('format'); } catch {}
		const source = findSource(allSources, requestedFormat);
		let content: string | null = null;
		let contentHtml: string | null = null;
		if (source) {
			try {
				const textRes = await fetch(sourceUrl(params.id, source));
				if (textRes.ok && source.format !== 'pdf') {
					const raw = await textRes.text();
					const base = `https://writings.data.heterarchy.fyi/writings/${params.id}/`;
					const rebase = (html: string) =>
						html.replace(/\s(src|href)="(?!https?:\/\/|\/\/|#)([^"]+)"/g, ` $1="${base}$2"`);
					if (source.format === 'md') {
						const bodyMarker = raw.indexOf('<!-- body -->');
						const body = bodyMarker !== -1 ? raw.slice(bodyMarker + '<!-- body -->'.length).trimStart() : raw;
						contentHtml = rebase(await renderMarkdown(processWikilinks(body, locale, slugMap)));
					} else if (source.format === 'html') {
						contentHtml = rebase(processWikilinks(raw, locale, slugMap));
					} else {
						content = raw;
					}
				}
			} catch {}
		}

		const mapSource = (s: WritingSource, list: WritingSource[]) => ({
			...s,
			key: sourceKey(s, list),
			url: sourceUrl(params.id, s),
			size: writing._assets?.[s.path]?.size ?? null,
			mime: writing._assets?.[s.path]?.mime ?? null,
		});

		const viewableSourcesMapped = viewableSources.map((s) => mapSource(s, viewableSources));
		const downloadSourcesMapped = downloadSources.map((s) => mapSource(s, downloadSources));

		const rawAudio = writing.audio?.[0] ?? null;
		const audio = rawAudio ? {
			url: rawAudio.url,
			duration: rawAudio.duration ?? null,
			peaks: rawAudio.peaks ?? null,
			transcriptUrl: rawAudio.transcript
				? `https://writings.data.heterarchy.fyi/writings/${params.id}/${rawAudio.transcript}`
				: null,
			durationSeconds: rawAudio.duration
				? rawAudio.duration.split(':').reduce((m: number, s: string, i: number, a: string[]) =>
					i === a.length - 1 ? m + Number(s) : m + Number(s) * 60, 0)
				: null,
		} : null;

		return {
			writing,
			glossaryTerms,
			descriptionHtml,
			content,
			contentHtml,
			readableSources: viewableSourcesMapped,
			downloadSources: downloadSourcesMapped,
			selectedSource: source
				? viewableSourcesMapped.find((s) => s.path === source.path) ?? null
				: null,
			audio,
			glossarySlugMap: slugMap,
			repository: writingsRepository,
		};
	} catch (e: any) {
		if (e?.status === 404) throw e;
		error(404, 'Writing not found');
	}
};
