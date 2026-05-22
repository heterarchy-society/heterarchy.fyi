import { error } from '@sveltejs/kit';
import {
	findGlossaryTerm,
	getGlossaryBacklinks,
	getGlossaryEntries,
	getGlossaryIndexTerms
} from '$lib/server/glossary';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const term = findGlossaryTerm(params.id);

	if (!term) {
		error(404, 'Term not found');
	}

	const slug = (term.translations?.cs?.slug as string | undefined) ?? null;

	return {
		term,
		backlinks: getGlossaryBacklinks(term.id),
		allTerms: getGlossaryIndexTerms(),
		// Alternate URLs for the language switcher
		altUrls: {
			en: `/glossary/${term.id}`,
			cs: `/cs/glosar/${slug ?? term.id}`,
		},
	};
};

export function entries() {
	return getGlossaryEntries();
}
