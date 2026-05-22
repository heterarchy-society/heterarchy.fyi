import { error } from '@sveltejs/kit';
import glossaryData from '$lib/data/glossary.json';
import type { PageLoad } from './$types';

export function load({ params }: Parameters<PageLoad>[0]) {
	const term = glossaryData.terms.find((t) => t.id === params.id);

	if (!term) {
		error(404, 'Pojem nenalezen');
	}

	const backlinks = glossaryData.terms.filter((t) =>
		t.resolvedLinks?.some((l) => l.target === params.id)
	);

	return { term, backlinks };
}

export function entries() {
	return glossaryData.terms.map((t) => ({ id: t.id }));
}
