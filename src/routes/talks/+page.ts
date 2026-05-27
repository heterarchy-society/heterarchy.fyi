import { talks, talkCollections, latestTalksRevision } from '$lib/data/talks';

export function load() {
	const sorted = [...talks].sort((a, b) => b.date.localeCompare(a.date));
	return {
		talks: sorted,
		collections: talkCollections,
		latestRevision: latestTalksRevision()
	};
}
