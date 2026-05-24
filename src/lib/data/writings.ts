import writingsData from './writings.json';

type Writing = {
	id: string;
	title: string;
	authors: string[];
	year: number | null;
	type: string;
	glossary: string[];
};

const writings: Writing[] = (writingsData as { writings: Writing[] }).writings;

export function getWritingsByGlossaryTerm(termId: string): Writing[] {
	return writings.filter((w) => w.glossary?.includes(termId));
}
