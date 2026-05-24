import { fetchCollectionChangelog, type CollectionChangelogEntry } from '$lib/server/changelog';

export type ChangelogEntry = CollectionChangelogEntry;

export async function load() {
	return { changelog: await fetchCollectionChangelog('https://writings.data.heterarchy.fyi/changelog.json') };
}
