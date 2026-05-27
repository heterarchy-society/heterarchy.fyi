import { error } from '@sveltejs/kit';
import { talksById, talkCollections, talks } from '$lib/data/talks';
import glossaryData from '$lib/data/glossary.json';
import { renderMarkdown } from '$lib/server/markdown';
import { processWikilinks, type GlossarySlugMap } from '$lib/wikilinks';
import { getLocale } from '$lib/paraglide/runtime';
import type { Locale } from '$lib/locale-storage';
import type { PageServerLoad } from './$types';

type GlossaryTerm = {
	id: string;
	name: string;
	translations?: Record<string, { slug?: string }>;
};

const glossary = (glossaryData as { terms: GlossaryTerm[] }).terms;

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

export function entries() {
	return talks.map((t) => ({ id: t.id }));
}

export const load: PageServerLoad = async ({ params }) => {
	const talk = talksById.get(params.id);
	if (!talk) error(404, 'Talk not found');

	const collection = talkCollections.find((c) => c.id === talk.collection) ?? null;

	const locale = getLocale() as Locale;
	const slugMap = buildSlugMap(locale);

	const descriptionHtml = talk.description
		? await renderMarkdown(processWikilinks(talk.description, locale, slugMap))
		: null;

	return { talk, collection, descriptionHtml };
};
