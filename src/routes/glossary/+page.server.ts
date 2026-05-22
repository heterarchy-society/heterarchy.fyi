import { getGlossaryIndex } from '$lib/server/glossary';

export type ChangelogEntry = {
	hash: string;
	date: string;
	author: string;
	message: string;
	changes: { id: string; op: 'added' | 'modified' }[];
};

async function fetchChangelog(): Promise<ChangelogEntry[]> {
	try {
		// Self-signed cert on glossary.heterarchy.fyi — bypass TLS verification
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		const res = await fetch('https://glossary.heterarchy.fyi/changelog.json');
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
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
	};
}
