import { events } from '$lib/data/events';
import { people } from '$lib/data/people';
import { talks } from '$lib/data/talks';
import { libraryBooks } from '$lib/data/library';
import { latestWritings } from '$lib/data/writings';
import { localizeUrl, locales } from '$lib/paraglide/runtime';
import glossaryData from '$lib/data/glossary.json';
import type { RequestHandler } from './$types';

export const prerender = true;

const ORIGIN = 'https://heterarchy.fyi';

const staticPaths = [
	'/',
	'/about',
	'/join',
	'/find-us',
	'/open-data',
	'/changelog',
	'/books',
	'/books/changelog',
	'/events',
	'/events/changelog',
	'/glossary',
	'/glossary/changelog',
	'/people',
	'/people/changelog',
	'/talks',
	'/talks/changelog',
	'/writings',
	'/writings/changelog',
];

function localHref(path: string, locale: (typeof locales)[number]): string {
	return localizeUrl(new URL(path, ORIGIN), { locale }).href;
}

function urlEntry(path: string, changefreq: string, priority: string): string {
	const loc = localHref(path, 'en');
	const alternates = locales
		.map((l) => `\t\t<xhtml:link rel="alternate" hreflang="${l}" href="${localHref(path, l)}" />`)
		.join('\n');
	return `\t<url>
\t\t<loc>${loc}</loc>
${alternates}
\t\t<changefreq>${changefreq}</changefreq>
\t\t<priority>${priority}</priority>
\t</url>`;
}

export const GET: RequestHandler = () => {
	const glossaryTermIds = (glossaryData as { terms: { id: string }[] }).terms.map((t) => t.id);

	const entries = [
		urlEntry('/', 'weekly', '1.0'),
		...staticPaths.slice(1).map((p) => {
			const isChangelog = p.endsWith('/changelog');
			return urlEntry(p, isChangelog ? 'monthly' : 'weekly', isChangelog ? '0.4' : '0.8');
		}),
		...events.map((e) => urlEntry(`/events/${e.id}`, 'monthly', '0.6')),
		...glossaryTermIds.map((id) => urlEntry(`/glossary/${id}`, 'monthly', '0.6')),
		...latestWritings.map((w) => urlEntry(`/writings/${w.id}`, 'monthly', '0.6')),
		...people.map((p) => urlEntry(`/people/${p.id}`, 'monthly', '0.6')),
		...talks.map((t) => urlEntry(`/talks/${t.id}`, 'monthly', '0.6')),
		...libraryBooks.map((b) => urlEntry(`/books/${b.id}`, 'monthly', '0.6')),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=3600',
		},
	});
};
