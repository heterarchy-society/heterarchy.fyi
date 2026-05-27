import { people, personAvatarUrl } from '$lib/data/people';
import { libraryBooks } from '$lib/data/books';
import { talks, parseSpeaker } from '$lib/data/talks';
import glossaryData from '$lib/data/glossary.json';
import writingsData from '$lib/data/writings.json';
import { firstParagraph } from '$lib/text';


type Locale = string;

const pagesByLocale: Record<string, { id: string; title: string; subtitle: string; url: string }[]> = {
	en: [
		{ id: 'home',      title: 'Home',      subtitle: 'heterarchy.fyi',                    url: '/' },
		{ id: 'glossary',  title: 'Glossary',  subtitle: 'Terms and concepts',                url: '/glossary' },
		{ id: 'books',     title: 'Books',     subtitle: 'Community library',                 url: '/books' },
		{ id: 'writings',  title: 'Writings',  subtitle: 'Articles and papers',               url: '/writings' },
		{ id: 'people',    title: 'People',    subtitle: 'People around parallel societies',  url: '/people' },
		{ id: 'events',    title: 'Events',    subtitle: 'Meetups and gatherings',            url: '/events' },
		{ id: 'talks',     title: 'Talks',     subtitle: 'Conference talks and lectures',     url: '/talks' },
		{ id: 'join',      title: 'Join',      subtitle: 'Get involved',                      url: '/join' },
		{ id: 'find-us',   title: 'Find Us',   subtitle: 'Where to find us',                  url: '/find-us' },
		{ id: 'about',     title: 'About',     subtitle: 'About Heterarchy',                  url: '/about' },
		{ id: 'open-data', title: 'Open Data', subtitle: 'Public datasets and API',           url: '/open-data' },
	],
	cs: [
		{ id: 'home',      title: 'Domů',          subtitle: 'heterarchy.fyi',                     url: '/' },
		{ id: 'glossary',  title: 'Glosář',         subtitle: 'Pojmy a koncepty',                   url: '/glossary' },
		{ id: 'books',     title: 'Knihy',          subtitle: 'Komunitní knihovna',                 url: '/books' },
		{ id: 'writings',  title: 'Texty',          subtitle: 'Články a eseje',                     url: '/writings' },
		{ id: 'people',    title: 'Lidé',           subtitle: 'Lidé kolem paralelních společností', url: '/people' },
		{ id: 'events',    title: 'Události',       subtitle: 'Setkání a akce',                     url: '/events' },
		{ id: 'talks',     title: 'Přednášky',      subtitle: 'Konferenční přednášky',              url: '/talks' },
		{ id: 'join',      title: 'Zapojit se',     subtitle: 'Jak se zapojit',                     url: '/join' },
		{ id: 'find-us',   title: 'Najdete nás',    subtitle: 'Kde nás najdete',                    url: '/find-us' },
		{ id: 'about',     title: 'O nás',          subtitle: 'O projektu Heterarchy',              url: '/about' },
		{ id: 'open-data', title: 'Otevřená data',  subtitle: 'Veřejné datasety a API',             url: '/open-data' },
	],
};

export function buildSearchIndex(locale: string) {
	const entries = [];

	// Pages — fall back to English for unknown locales
	for (const page of (pagesByLocale[locale] ?? pagesByLocale['en'])) {
		entries.push({ ...page, type: 'page' });
	}

	// People (no Czech translations — same for both locales)
	for (const person of people) {
		const thumbnail = person.avatarVersions?.['200w'] ?? personAvatarUrl(person) ?? undefined;
		entries.push({
			id: person.id,
			type: 'person',
			title: person.name,
			subtitle: person.caption || undefined,
			description: firstParagraph(person.description) || undefined,
			url: `/people/${person.id}`,
			thumbnail,
			keywords: [
				...(person.altNames ?? []),
				person.refs?.twitter,
				person.refs?.github,
			].filter(Boolean),
		});
	}

	// Glossary
	for (const term of (glossaryData as { terms: any[] }).terms) {
		const cs = term.translations?.cs;
		const isCs = locale === 'cs' && cs;
		entries.push({
			id: term.id,
			type: 'glossary',
			title: isCs && cs.name ? cs.name : term.name,
			subtitle: term.type,
			description: firstParagraph(isCs ? cs.description : term.description) || undefined,
			url: `/glossary/${term.id}`,
			keywords: [...(term.keywords ?? [])].filter(Boolean),
		});
	}

	// Books (no translations)
	for (const book of libraryBooks) {
		const authorsText = (book.authors ?? [])
			.map((a) => (typeof a === 'string' ? a.split('|')[0] : a.name))
			.join(', ');
		entries.push({
			id: book.id,
			type: 'book',
			title: book.title,
			subtitle: [authorsText, book.year].filter(Boolean).join(' · ') || undefined,
			url: `/books/${book.id}`,
			thumbnail: book.coverVersions?.['400w'] ?? book.coverVersions?.['200w'] ?? book.coverUrl,
		});
	}

	// Talks (no translations)
	for (const talk of talks) {
		const speakerNames = (talk.speakers ?? []).map((s) => parseSpeaker(s).name).join(', ');
		entries.push({
			id: talk.id,
			type: 'talk',
			title: talk.title,
			subtitle: [speakerNames, talk.date].filter(Boolean).join(' · ') || undefined,
			description: talk.description?.split(/\n\n+/)[0] || undefined,
			url: `/talks/${talk.id}`,
			thumbnail: talk.thumbnailVersions?.['400w'] ?? talk.thumbnailUrl ?? undefined,
		});
	}

	// Writings (no translations)
	for (const writing of (writingsData as { writings: any[] }).writings) {
		const authorsText = (writing.authors ?? []).map((a: string) => a.split('|')[0]).join(', ');
		entries.push({
			id: writing.id,
			type: 'writing',
			title: writing.title,
			subtitle: [writing.type, authorsText, writing.year].filter(Boolean).join(' · ') || undefined,
			url: `/writings/${writing.id}`,
		});
	}

	return entries;
}
