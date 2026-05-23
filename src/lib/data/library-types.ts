export type BookLanguage = 'en' | 'cs' | 'de';

export type BookFormat = 'ebook' | 'pdf' | 'web' | 'print';

export type LibraryLink = {
	href: string;
	label: string;
	external?: boolean;
};

export type LibraryBook = {
	id: string;
	title: string;
	author: string;
	year?: string;
	coverUrl?: string;
	description: string;
	language: BookLanguage[];
	formats: BookFormat[];
	/** K dispozici fyzicky */
	physical: boolean;
	links: LibraryLink[];
	source?: { name: string; href: string };
	glossary?: string[];
};
