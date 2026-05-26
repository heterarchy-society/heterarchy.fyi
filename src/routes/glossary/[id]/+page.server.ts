import { error, redirect } from '@sveltejs/kit';
import {
	findGlossaryTerm,
	getGlossaryBacklinks,
	getGlossaryEntries,
	getGlossarySummaryTerms
} from '$lib/server/glossary';
import { getBooksByGlossaryTerm } from '$lib/data/library';
import { getWritingsByGlossaryTerm } from '$lib/data/writings';
import glossaryData from '$lib/data/glossary.json';
import { datasetConfigs } from '$lib/data/datasets';
import type { PageServerLoad } from './$types';

const { repository: glossaryRepository, github: glossaryGithub } = datasetConfigs.find((d) => d.id === 'glossary')!;

const redirects = (glossaryData.meta as { redirects?: Record<string, string> } | undefined)?.redirects ?? {};

export const load: PageServerLoad = ({ params }) => {
	const target = redirects[params.id];
	if (target) redirect(301, `/glossary/${target}`);

	const term = findGlossaryTerm(params.id);

	if (!term) {
		error(404, 'Term not found');
	}

	const slug = (term.translations?.cs?.slug as string | undefined) ?? null;
	const backlinks = getGlossaryBacklinks(term.id);
	const relatedTermIds = new Set<string>();

	for (const link of term.resolvedLinks ?? []) {
		if (link.target) relatedTermIds.add(link.target);
	}
	for (const backlink of backlinks) {
		relatedTermIds.add(backlink.id);
	}

	return {
		term,
		backlinks,
		books: getBooksByGlossaryTerm(term.id),
		writings: getWritingsByGlossaryTerm(term.id),
		relatedTerms: getGlossarySummaryTerms(relatedTermIds),
		repository: glossaryRepository,
		github: glossaryGithub ?? null,
		// Alternate URLs for the language switcher
		altUrls: {
			en: `/glossary/${term.id}`,
			cs: `/cs/glosar/${slug ?? term.id}`,
		},
	};
};

export function entries() {
	return [
		...getGlossaryEntries(),
		...Object.keys(redirects).map((id) => ({ id })),
	];
}
