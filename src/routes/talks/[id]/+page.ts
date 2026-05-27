import { error } from '@sveltejs/kit';
import { talksById, talkCollections } from '$lib/data/talks';

export function load({ params }: { params: { id: string } }) {
	const talk = talksById.get(params.id);
	if (!talk) error(404, 'Talk not found');

	const collection = talkCollections.find((c) => c.id === talk.collection) ?? null;

	return { talk, collection };
}
