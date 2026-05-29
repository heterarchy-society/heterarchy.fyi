import { redirect } from '@sveltejs/kit';
import { people, peopleById } from '$lib/data/people';
import peopleData from '$lib/data/people.json';
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
const redirects = (peopleData.meta?.redirects ?? {}) as Record<string, string>;

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

export const load: PageServerLoad = async ({ params }) => {
	const target = redirects[params.id];
	if (target) redirect(301, `/people/${target}`);

	const person = peopleById.get(params.id);
	const locale = getLocale() as Locale;
	const slugMap = buildSlugMap(locale);

	const descriptionHtml = person?.description
		? await renderMarkdown(processWikilinks(person.description, locale, slugMap))
		: null;

	return { descriptionHtml };
};

export function entries() {
	return [
		...people.map((person) => ({ id: person.id })),
		...Object.keys(redirects).map((id) => ({ id })),
	];
}
