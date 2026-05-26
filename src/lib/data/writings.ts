import writingsData from './writings.json';
import { peopleById, type Person } from './people';

type Writing = {
	id: string;
	title: string;
	authors: string[];
	year: number | null;
	type: string;
	glossary: string[];
};

const writings: Writing[] = (writingsData as { writings: Writing[] }).writings;

export const latestWritings = [...writings]
	.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
	.slice(0, 5);

export type { Writing };

export function getWritingsByGlossaryTerm(termId: string): Writing[] {
	return writings.filter((w) => w.glossary?.includes(termId));
}

export function getWritingsByPersonId(personId: string): Writing[] {
	return writings.filter((w) =>
		w.authors.some((a) => a.split('|')[1]?.trim() === personId)
	);
}

export type WritingAuthorRef = {
	name: string;
	personId?: string;
	person?: Person;
};

function parseWritingAuthor(raw: string): WritingAuthorRef | null {
	const [name, personId] = raw.split('|').map((part) => part.trim());
	if (!name) return null;
	return {
		name,
		personId,
		person: personId ? peopleById.get(personId) : undefined
	};
}

export function writingAuthorRefs(authors: string[]): WritingAuthorRef[] {
	return authors.map(parseWritingAuthor).filter((a): a is WritingAuthorRef => Boolean(a));
}

export function writingAuthorText(authors: string[]): string {
	return writingAuthorRefs(authors).map((a) => a.person?.name ?? a.name).join(', ');
}
