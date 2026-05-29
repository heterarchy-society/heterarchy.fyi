import { events } from '$lib/data/events';
import { people } from '$lib/data/people';
import { talks } from '$lib/data/talks';
import { libraryBooks } from '$lib/data/library';
import { latestWritings } from '$lib/data/writings';
import glossaryData from '$lib/data/glossary.json';
import type { RequestHandler } from './$types';

export const prerender = true;

const ORIGIN = 'https://heterarchy.fyi';

type GlossaryTerm = {
	id: string;
	name: string;
	description?: string;
};

function firstSentence(text: string): string {
	const clean = text.replace(/\[\[([^\|\]]+?)(?:\|([^\]]+?))?\]\]/g, (_, id, label) => label ?? id);
	const match = clean.match(/^.{20,}?[.!?](?:\s|$)/s);
	return match ? match[0].trim() : clean.slice(0, 160).trim();
}

function writingAuthors(authors: string[]): string {
	return authors.map((a) => a.split('|')[0]).join(', ');
}

export const GET: RequestHandler = () => {
	const terms = (glossaryData as { terms: GlossaryTerm[] }).terms;

	const sections: string[] = [];

	// Header
	sections.push(`# The Heterarchy Society`);
	sections.push(`\n> A community around sovereign technologies, decentralized systems and non-hierarchical forms of organization.`);

	// About
	sections.push(`\n## About

The Heterarchy Society is a community focused on sovereign technologies, parallel structures, and non-hierarchical forms of organization. This site collects writing, talks, a glossary, books, events, and people related to heterarchy, decentralization, cryptography, and adjacent topics. The content is open data, published under free licenses, and maintained collaboratively on git.`);

	// Main sections
	sections.push(`\n## Sections

- [Glossary](${ORIGIN}/glossary): Definitions of ${terms.length} key concepts — heterarchy, cypherpunk, agorism, and more
- [Books](${ORIGIN}/books): Recommended reading list — ${libraryBooks.length} books
- [Writings](${ORIGIN}/writings): Essays, articles, and texts — ${latestWritings.length} entries
- [Talks](${ORIGIN}/talks): Talks and presentations — ${talks.length} entries
- [Events](${ORIGIN}/events): Past and upcoming events — ${events.length} entries
- [People](${ORIGIN}/people): Community members and referenced people — ${people.length} entries
- [About](${ORIGIN}/about): Manifesto and background
- [Open Data](${ORIGIN}/open-data): Machine-readable JSON datasets for all collections`);

	// Glossary
	const glossaryLines = terms.map((term) => {
		const desc = term.description ? ': ' + firstSentence(term.description) : '';
		return `- [${term.name}](${ORIGIN}/glossary/${term.id})${desc}`;
	});
	sections.push(`\n## Glossary (${terms.length} terms)\n\n${glossaryLines.join('\n')}`);

	// Writings
	const writingLines = latestWritings.map((w) => {
		const meta = [writingAuthors(w.authors), w.year].filter(Boolean).join(', ');
		return `- [${w.title}](${ORIGIN}/writings/${w.id})${meta ? ` (${meta})` : ''}`;
	});
	sections.push(`\n## Writings\n\n${writingLines.join('\n')}`);

	// Books
	const bookLines = libraryBooks.map((b) => {
		const authors = (b.authors as string[]).map((a) => a.split('|')[0]).join(', ');
		const meta = [authors, b.year].filter(Boolean).join(', ');
		const desc = b.description ? ': ' + b.description.slice(0, 120).replace(/\n.*/s, '').trim() : '';
		return `- [${b.title}](${ORIGIN}/books/${b.id}) (${meta})${desc}`;
	});
	sections.push(`\n## Books\n\n${bookLines.join('\n')}`);

	// People
	const peopleLines = people.map((p) => {
		const desc = p.caption ? ': ' + p.caption : p.description ? ': ' + firstSentence(p.description) : '';
		return `- [${p.name}](${ORIGIN}/people/${p.id})${desc}`;
	});
	sections.push(`\n## People\n\n${peopleLines.join('\n')}`);

	const body = sections.join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=3600',
		},
	});
};
