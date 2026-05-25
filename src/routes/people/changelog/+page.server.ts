import { fetchCollectionChangelog } from '$lib/server/changelog';
import { people } from '$lib/data/people';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const changelog = await fetchCollectionChangelog('https://people.data.heterarchy.fyi/changelog.json');
	return { changelog, people };
};
