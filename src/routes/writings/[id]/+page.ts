import { error } from '@sveltejs/kit';
import glossaryData from '$lib/data/glossary.json';
import { renderMarkdown } from '$lib/markdown';
import type { Writing } from '../+page';

type WritingSource = Writing['sources'][number];

type GlossaryTerm = {
	id: string;
	name: string;
	type?: string;
	translations?: Record<string, { slug?: string; name?: string }>;
};

const glossary = (glossaryData as { terms: GlossaryTerm[] }).terms;
const glossaryById = new Map(glossary.map((t) => [t.id, t]));

const viewableFormats = new Set(['md', 'html', 'txt', 'pdf']);
const downloadableFormats = new Set(['md', 'html', 'txt', 'pdf', 'typst', 'typ']);
const formatOrder = new Map([
	['md', 0],
	['html', 1],
	['txt', 2],
	['pdf', 3],
	['typst', 4],
	['typ', 4],
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
	const readable = sortSources(sources.filter((source) => viewableFormats.has(source.format)));
	if (readable.length === 0) return sources[0] ?? null;
	if (requested) {
		const normalized = requested.toLowerCase();
		const match = readable.find((source) =>
			sourceKey(source, readable) === normalized
			|| source.format === normalized
			|| source.variant === normalized
			|| source.path === requested
		);
		if (match) return match;
	}
	return readable.find((s) => s.format === 'md')
		?? readable.find((s) => s.format === 'html')
		?? readable.find((s) => s.format === 'txt')
		?? readable.find((s) => s.format === 'pdf')
		?? readable[0];
}

export async function load({ params, url, fetch }: { params: { id: string }; url: URL; fetch: typeof globalThis.fetch }) {
	try {
		const res = await fetch(`https://writings.data.heterarchy.fyi/writings/${params.id}.json`);
		if (!res.ok) error(404, 'Writing not found');
		const writing: Writing = await res.json();
		const allSources = writing.sources ?? [];
		const viewableSources = sortSources(allSources.filter((s) => viewableFormats.has(s.format)));
		const downloadSources = sortSources(allSources.filter((s) => downloadableFormats.has(s.format)));

		const glossaryTerms = (writing.glossary ?? [])
			.map((id) => glossaryById.get(id))
			.filter((t): t is GlossaryTerm => Boolean(t));

		const source = findSource(allSources, url.searchParams.get('format'));
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
						contentHtml = rebase(renderMarkdown(body));
					} else if (source.format === 'html') {
						contentHtml = rebase(raw);
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

		return {
			writing,
			glossaryTerms,
			content,
			contentHtml,
			readableSources: viewableSourcesMapped,
			downloadSources: downloadSourcesMapped,
			selectedSource: source
				? viewableSourcesMapped.find((s) => s.path === source.path) ?? null
				: null,
		};
	} catch (e: any) {
		if (e?.status === 404) throw e;
		error(404, 'Writing not found');
	}
}

export async function entries() {
	try {
		const res = await fetch('https://writings.data.heterarchy.fyi/');
		const data = await res.json();
		return (data.writings ?? []).map((w: { id: string }) => ({ id: w.id }));
	} catch {
		return [];
	}
}
