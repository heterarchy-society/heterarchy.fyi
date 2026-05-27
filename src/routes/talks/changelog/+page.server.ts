import { fetchCollectionChangelog } from '$lib/server/changelog';
import { talks } from '$lib/data/talks';

export async function load() {
	const changelog = await fetchCollectionChangelog('https://talks.data.heterarchy.fyi/changelog.json');
	return { changelog, talks: talks.map((t) => ({ id: t.id, title: t.title })) };
}
