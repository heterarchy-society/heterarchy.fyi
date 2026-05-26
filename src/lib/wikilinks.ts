import { knownCollections, datasetUrl, glossaryUrl } from '$lib/data/routes';
import type { Locale } from '$lib/locale-storage';

// Compact map: normalised term key (id / name / name-with-hyphens) → locale slug
export type GlossarySlugMap = Record<string, string>;

export function processWikilinks(
	text: string,
	locale: Locale,
	glossarySlugMap: GlossarySlugMap,
): string {
	// [[id]] or [[id|display]] — left is the target id, right is visible label
	let result = text.replace(/\[\[([^\|\]]+?)(?:\|([^\]]+?))?\]\]/g, (_, left, right) => {
		const id = left.trim();
		const display = (right !== undefined ? right : left).trim();
		const slug =
			glossarySlugMap[id.toLowerCase()] ??
			glossarySlugMap[id.toLowerCase().replace(/\s+/g, '-')] ??
			glossarySlugMap[id];
		if (!slug) return display;
		return `<a href="${glossaryUrl(slug, locale)}">${display}</a>`;
	});
	// [label](collection:id) — cross-dataset markdown links
	result = result.replace(/\[([^\]]+)\]\(([a-z]+):([^)\s]+)\)/g, (full, label, collection, id) => {
		if (!knownCollections.has(collection)) return full;
		const href = datasetUrl(collection, id, locale);
		if (!href) return label;
		return `<a href="${href}">${label}</a>`;
	});
	return result;
}
