import { error } from '@sveltejs/kit';
import glossaryData from '$lib/data/glossary.json';
import type { PageServerLoad } from './$types';

function csSlug(term: any): string | null {
	return term.translations?.cs?.slug ?? null;
}

export const load: PageServerLoad = ({ params }) => {
	const term = glossaryData.terms.find(
		(t) => t.id === params.id || csSlug(t) === params.id
	);

	if (!term) {
		error(404, 'Term not found');
	}

	const backlinks = glossaryData.terms.filter((t) =>
		t.resolvedLinks?.some((l) => l.target === term.id)
	);

	const slug = csSlug(term);

	return {
		term,
		backlinks,
		allTerms: glossaryData.terms,
		// Alternate URLs for the language switcher
		altUrls: {
			en: `/glossary/${term.id}`,
			cs: `/cs/glosar/${slug ?? term.id}`,
		},
	};
};

export function entries() {
	return glossaryData.terms.flatMap((t) => {
		const slug = csSlug(t);
		return slug && slug !== t.id
			? [{ id: t.id }, { id: slug }]
			: [{ id: t.id }];
	});
}
