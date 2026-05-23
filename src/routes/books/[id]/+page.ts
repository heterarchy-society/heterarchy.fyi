import { error } from '@sveltejs/kit';
import { getBookById, libraryBooks } from '$lib/data/library';
import glossaryData from '$lib/data/glossary.json';
import type { PageLoad } from './$types';

type GlossaryTermSummary = {
	id: string;
	name: string;
	type?: string;
	translations?: Record<string, { slug?: string; name?: string; type?: string }>;
};

const glossary = (glossaryData as { terms: GlossaryTermSummary[] }).terms;
const glossaryById = new Map(glossary.map((term) => [term.id, term]));

function relatedGlossary(book: NonNullable<ReturnType<typeof getBookById>>): GlossaryTermSummary[] {
	const ids = new Set(book.glossary ?? []);
	return [...ids].map((id) => glossaryById.get(id)).filter((term): term is GlossaryTermSummary => Boolean(term));
}

export function load({ params }: Parameters<PageLoad>[0]) {
	const book = getBookById(params.id);

	if (!book) {
		error(404, 'Kniha nenalezena');
	}

	return { book, glossary: relatedGlossary(book) };
}

export function entries() {
	return libraryBooks.map((book) => ({ id: book.id }));
}
