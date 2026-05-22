import glossaryData from '$lib/data/glossary.json';

export function load() {
	return {
		terms: glossaryData.terms,
		meta: glossaryData.meta
	};
}
