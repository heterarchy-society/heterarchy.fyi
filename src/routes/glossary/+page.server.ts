import { getGlossaryIndex } from '$lib/server/glossary';
import glossaryData from '$lib/data/glossary.json';

export type ChangelogEntry = {
	hash: string;
	date: string;
	author: string;
	message: string;
	changes: { id: string; op: 'added' | 'modified' }[];
};

export type Contributor = {
	name: string;
	commits: number;
	gh_username?: string;
};

function getContributors(): Contributor[] {
	const counts = new Map<string, { commits: number; gh_username?: string }>();
	for (const term of (glossaryData as any).terms) {
		for (const a of term.authors ?? []) {
			const existing = counts.get(a.name);
			if (!existing) {
				counts.set(a.name, { commits: 1, gh_username: a.gh_username });
			} else {
				existing.commits += 1;
			}
		}
	}
	return [...counts.entries()]
		.map(([name, { commits, gh_username }]) => ({ name, commits, gh_username }))
		.sort((a, b) => b.commits - a.commits);
}

async function fetchChangelog(): Promise<ChangelogEntry[]> {
	try {
		const res = await fetch('https://glossary.data.heterarchy.fyi/changelog.json');
		if (!res.ok) return [];
		return await res.json();
	} catch {
		return [];
	}
}

export async function load() {
	const [index, changelog] = await Promise.all([
		Promise.resolve(getGlossaryIndex()),
		fetchChangelog(),
	]);
	return {
		terms: index.terms,
		meta: index.meta,
		changelog: changelog.slice(0, 20),
		contributors: getContributors(),
	};
}
