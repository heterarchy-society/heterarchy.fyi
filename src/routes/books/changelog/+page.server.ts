import { fetchCollectionChangelog } from '$lib/server/changelog';
import { libraryBooks } from '$lib/data/library';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const changelog = await fetchCollectionChangelog('https://books.data.heterarchy.fyi/changelog.json');
	return { changelog, books: libraryBooks };
};
