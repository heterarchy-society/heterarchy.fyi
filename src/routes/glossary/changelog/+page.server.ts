import { fetchCollectionChangelog } from '$lib/server/changelog';
import { getGlossaryIndexTerms } from '$lib/server/glossary';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [changelog, terms] = await Promise.all([
		fetchCollectionChangelog('https://glossary.data.heterarchy.fyi/changelog.json'),
		Promise.resolve(getGlossaryIndexTerms())
	]);

	return { changelog, terms };
};
