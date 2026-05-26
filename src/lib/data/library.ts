import { libraryBooks as booksByAdded } from './books';
import { peopleById, type Person } from './people';
import type { BookFormat, BookLanguage, LibraryBook } from './library-types';

/** Seřazeno podle roku vydání, nejnovější první */
export const libraryBooks: LibraryBook[] = [...booksByAdded].sort(
	(a, b) => Number(b.year ?? 0) - Number(a.year ?? 0)
);

export type { BookFormat, BookLanguage, LibraryBook, LibraryLink } from './library-types';

export const formatLabels: Record<BookFormat, string> = {
	ebook: 'e-book',
	pdf: 'PDF',
	web: 'web',
	print: 'tištěná'
};

export const languageLabels: Record<BookLanguage, string> = {
	en: 'angličtina',
	cs: 'čeština',
	de: 'němčina'
};

export function bookPath(id: string): string {
	return `/books/${id}`;
}

export type BookAuthorRef = {
	name: string;
	personId?: string;
	person?: Person;
};

function parseBookAuthor(raw: string): BookAuthorRef | null {
	const [name, personId] = raw.split('|').map((part) => part.trim());

	if (!name) return null;

	return {
		name,
		personId,
		person: personId ? peopleById.get(personId) : undefined
	};
}

export function bookAuthorRefs(book: LibraryBook): BookAuthorRef[] {
	const explicitAuthors = book.authors?.filter((author): author is string => typeof author === 'string' && author.trim().length > 0) ?? [];
	const authors = explicitAuthors.length ? explicitAuthors : book.author ? [book.author] : [];
	return authors.map(parseBookAuthor).filter((author): author is BookAuthorRef => Boolean(author));
}

export function bookAuthorText(book: LibraryBook): string {
	return bookAuthorRefs(book)
		.map((author) => author.name)
		.join(', ');
}

export function getBookById(id: string): LibraryBook | undefined {
	return libraryBooks.find((b) => b.id === id);
}

export function getBooksByGlossaryTerm(termId: string): LibraryBook[] {
	return libraryBooks.filter((book) => book.glossary?.includes(termId));
}

export const libraryName = 'Komunitní svobodomyslná knihovna';

export const libraryLocation = {
	name: 'Bordel',
	city: 'Praha',
	note: 'Fyzické kopie si půjčíte na poličce (připravujeme!).'
};

export const libraryIntro = {
	label: 'Knihy',
	lead: 'E-booky i fyzické kopie — u každého titulu jazyk, formáty a odkazy.'
};

export const libraryContribute = {
	text: 'Chybí kniha? Napiš nám.',
	links: [
		{ label: '→ kde nás najdete?', href: '/find-us' },
		{ label: '→ zapojit se', href: '/zapojit-se' }
	]
};

export const libraryMeta = {
	title: 'Knihy — The Heterarchy Society',
	description: `${libraryName} — katalog knih The Heterarchy Society.`
};

export const libraryPreview = libraryBooks.slice(0, 4);
