import { error } from '@sveltejs/kit';
import glossaryData from '$lib/data/glossary.json';
import type { PageLoad } from './$types';

function csSlug(term: any): string | null {
	return term.translations?.cs?.slug ?? null;
}

export function load({ params }: Parameters<PageLoad>[0]) {
	const term = glossaryData.terms.find(
		(t) => t.id === params.id || csSlug(t) === params.id
	);

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
}
