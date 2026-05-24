import { error } from '@sveltejs/kit';
import glossaryData from '$lib/data/glossary.json';
import { renderMarkdown } from '$lib/markdown';
import type { Writing } from '../+page';

type GlossaryTerm = {
	id: string;
	name: string;
	type?: string;
	translations?: Record<string, { slug?: string; name?: string }>;
};

const glossary = (glossaryData as { terms: GlossaryTerm[] }).terms;
const glossaryById = new Map(glossary.map((t) => [t.id, t]));

export async function load({ params, fetch }: { params: { id: string }; fetch: typeof globalThis.fetch }) {
	try {
		const res = await fetch(`https://writings.data.heterarchy.fyi/writings/${params.id}.json`);
		if (!res.ok) error(404, 'Writing not found');
		const writing: Writing = await res.json();

		const glossaryTerms = (writing.glossary ?? [])
			.map((id) => glossaryById.get(id))
			.filter((t): t is GlossaryTerm => Boolean(t));

		const source = writing.sources?.find((s) => s.format === 'md')
			?? writing.sources?.find((s) => s.format === 'txt')
			?? writing.sources?.[0]
			?? null;
		let content: string | null = null;
		let contentHtml: string | null = null;
		if (source) {
			try {
				const textRes = await fetch(`https://writings.data.heterarchy.fyi/writings/${params.id}/${source.path}`);
				if (textRes.ok) {
					const raw = await textRes.text();
					if (source.format === 'md') {
						contentHtml = renderMarkdown(raw);
					} else {
						content = raw;
					}
				}
			} catch {}
		}

		return { writing, glossaryTerms, content, contentHtml };
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
