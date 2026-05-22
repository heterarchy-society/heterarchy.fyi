import { libraryBooks as booksByAdded } from './books';
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

export function getBookById(id: string): LibraryBook | undefined {
	return libraryBooks.find((b) => b.id === id);
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
