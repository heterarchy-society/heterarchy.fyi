import { json } from '@sveltejs/kit';
import { locales } from '$lib/paraglide/runtime';
import { buildSearchIndex } from '$lib/server/search-builder';
import type { RequestHandler } from './$types';

export const prerender = true;

export function entries() {
	return locales.map((locale) => ({ locale }));
}

export const GET: RequestHandler = ({ params }) => json(buildSearchIndex(params.locale));
