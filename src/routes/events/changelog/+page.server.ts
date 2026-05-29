import { fetchCollectionChangelog } from '$lib/server/changelog';
import { events } from '$lib/data/events';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const changelog = await fetchCollectionChangelog('https://events.data.heterarchy.fyi/changelog.json');
	return { changelog, events };
};
