import { redirect } from '@sveltejs/kit';
import { events, eventsById } from '$lib/data/events';
import eventsData from '$lib/data/events.json';
import { renderMarkdown } from '$lib/server/markdown';
import type { PageServerLoad } from './$types';

const redirects = ((eventsData as { meta?: { redirects?: Record<string, string> } }).meta?.redirects ??
	{}) as Record<string, string>;

export const load: PageServerLoad = async ({ params }) => {
	const target = redirects[params.id];
	if (target) redirect(301, `/events/${target}`);

	const event = eventsById.get(params.id);

	const descriptionHtml = event?.description
		? await renderMarkdown(event.description)
		: null;

	return { descriptionHtml };
};

export function entries() {
	return [
		...events.map((event) => ({ id: event.id })),
		...Object.keys(redirects).map((id) => ({ id })),
	];
}
