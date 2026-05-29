import { redirect } from '@sveltejs/kit';
import { events, eventsById } from '$lib/data/events';
import eventsData from '$lib/data/events.json';
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
const redirects = ((eventsData as { meta?: { redirects?: Record<string, string> } }).meta?.redirects ??
	{}) as Record<string, string>;

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
	if (target) redirect(301, `/events/${target}`);

	const event = eventsById.get(params.id);
	const locale = getLocale() as Locale;
	const slugMap = buildSlugMap(locale);

	const descriptionHtml = event?.description
		? await renderMarkdown(processWikilinks(event.description, locale, slugMap))
		: null;

	return { descriptionHtml };
};

export function entries() {
	return [
		...events.map((event) => ({ id: event.id })),
		...Object.keys(redirects).map((id) => ({ id })),
	];
}
