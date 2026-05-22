import { error, redirect } from '@sveltejs/kit';
import glossaryData from '$lib/data/glossary.json';
import type { PageLoad } from './$types';

function csSlug(term: any): string | null {
	return term.translations?.cs?.slug ?? null;
}

export function load({ params }: Parameters<PageLoad>[0]) {
	// Find by EN id or CS slug
	const term = glossaryData.terms.find(
		(t) => t.id === params.id || csSlug(t) === params.id
	);

	if (!term) {
		error(404, 'Pojem nenalezen');
	}

	// Redirect EN id to CS slug if available
	const slug = csSlug(term);
	if (slug && params.id === term.id && slug !== term.id) {
		redirect(301, `/glosar/${slug}`);
	}

	const backlinks = glossaryData.terms.filter((t) =>
		t.resolvedLinks?.some((l) => l.target === term.id)
	);

	return { term, backlinks, allTerms: glossaryData.terms };
}

export function entries() {
	return glossaryData.terms.flatMap((t) => {
		const slug = csSlug(t);
		return slug && slug !== t.id
			? [{ id: t.id }, { id: slug }]
			: [{ id: t.id }];
	});
}
