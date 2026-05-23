import { fetchCollectionChangelog, type CollectionChangelogEntry } from '$lib/server/changelog';

export type ChangelogEntry = CollectionChangelogEntry;

async function fetchChangelog(): Promise<ChangelogEntry[]> {
	return fetchCollectionChangelog('https://books.data.heterarchy.fyi/changelog.json');
}

export async function load() {
	return { changelog: await fetchChangelog() };
}
