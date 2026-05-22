import { error } from '@sveltejs/kit';
import { getGlossaryHistoryTerm } from '$lib/server/glossary';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const term = getGlossaryHistoryTerm(params.id);

	if (!term) {
		error(404, 'Term not found');
	}

	return { term, termId: term.id };
};
