import { error } from '@sveltejs/kit';
import { findGlossaryTerm } from '$lib/server/glossary';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const term = findGlossaryTerm(params.id);

	if (!term) {
		error(404, 'Term not found');
	}

	const cs = (term as any).translations?.cs ?? null;

	return {
		termId: term.id,
		termSlug: cs?.slug ?? term.id,
		termName: term.name,
		commitHash: params.hash
	};
};
