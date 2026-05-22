import { error } from '@sveltejs/kit';
import { getBookById, libraryBooks } from '$lib/data/library';
import type { PageLoad } from './$types';

export function load({ params }: Parameters<PageLoad>[0]) {
	const book = getBookById(params.id);

	if (!book) {
		error(404, 'Kniha nenalezena');
	}

	return { book };
}

export function entries() {
	return libraryBooks.map((book) => ({ id: book.id }));
}
