import { fetchCollectionChangelog, type CollectionChangelogEntry } from '$lib/server/changelog';

export type ChangelogEntry = CollectionChangelogEntry;

export async function load() {
	try {
		const changelog = await fetchCollectionChangelog('https://writings.data.heterarchy.fyi/changelog.json');
		return { changelog };
	} catch {
		return { changelog: [] as ChangelogEntry[] };
	}
}
