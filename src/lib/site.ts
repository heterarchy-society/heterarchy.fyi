/** Canonical production origin for absolute URLs baked in at prerender time. */
export const siteOrigin = 'https://heterarchy.fyi';

export function absoluteSiteUrl(path: string): string {
	return new URL(path, siteOrigin).href;
}

export function absoluteOgImageUrl(collection: string, id: string, basePath = ''): string {
	return absoluteSiteUrl(`${basePath}/og/${collection}/${id}.png`);
}
