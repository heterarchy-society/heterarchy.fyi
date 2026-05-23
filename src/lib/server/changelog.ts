export type CollectionChange = {
	id: string;
	op: 'added' | 'modified' | string;
};

export type CollectionChangelogEntry = {
	hash: string;
	date: string;
	author: string;
	email?: string;
	message: string;
	changes: CollectionChange[];
};

export async function fetchCollectionChangelog(url: string): Promise<CollectionChangelogEntry[]> {
	try {
		const res = await fetch(url);
		if (!res.ok) return [];
		return await res.json();
	} catch {
		return [];
	}
}
