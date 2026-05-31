import { error } from '@sveltejs/kit';
import writingsData from '$lib/data/writings.json';
import { writingAuthorRefs, writingAuthorText, writingExcerpt, writingReadingLengthText, type Writing } from '$lib/data/writings';
import { personAvatarUrl } from '$lib/data/people';
import { renderOgImage } from '$lib/server/og';
import type { RequestHandler } from './$types';

type OgEntry = {
	id: string;
	collection: string;
	title: string;
	description?: string | null;
	meta?: string[];
	avatarUrl?: string | null;
};

type OgCollection = {
	entries: () => OgEntry[];
	find: (id: string) => OgEntry | null;
};

type WritingWithAssets = Writing & {
	date?: string;
	sources?: { path: string; format: string; generated_from?: string }[];
	_assets?: Record<string, { text?: { words?: number } } | undefined>;
};

const writings = (writingsData as unknown as { writings: WritingWithAssets[] }).writings;

function formatDate(date: string | undefined, locale = 'en'): string | null {
	if (!date) return null;
	return new Date(date).toLocaleDateString(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

const collections: Record<string, OgCollection> = {
	writings: {
		entries: () =>
			writings.map((writing) => ({
				id: writing.id,
				collection: 'Writings',
				title: writing.title,
				description: writingExcerpt(writing),
				avatarUrl: writingAuthorRefs(writing.authors).map((author) => author.person ? personAvatarUrl(author.person) : null).find(Boolean) ?? null,
				meta: [
					writingAuthorText(writing.authors),
					formatDate(writing.date) ?? (writing.year ? String(writing.year) : null),
					writingReadingLengthText(writing),
				].filter((value): value is string => Boolean(value)),
			})),
		find: (id) => collections.writings.entries().find((entry) => entry.id === id) ?? null,
	},
};

export const prerender = true;

export function entries() {
	return Object.entries(collections).flatMap(([collection, config]) =>
		config.entries().map((entry) => ({
			collection,
			id: entry.id,
		}))
	);
}

export const GET: RequestHandler = async ({ params }) => {
	const entry = collections[params.collection]?.find(params.id);
	if (!entry) error(404, 'OG image not found');

	const png = await renderOgImage(entry);

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
