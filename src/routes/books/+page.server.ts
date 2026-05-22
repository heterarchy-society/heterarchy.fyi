export type ChangelogEntry = {
	hash: string;
	date: string;
	author: string;
	message: string;
	changes: { id: string; op: string }[];
};

async function fetchChangelog(): Promise<ChangelogEntry[]> {
	try {
		const res = await fetch('https://books.data.heterarchy.fyi/changelog.json');
		if (!res.ok) return [];
		return await res.json();
	} catch {
		return [];
	}
}

export async function load() {
	return { changelog: await fetchChangelog() };
}
