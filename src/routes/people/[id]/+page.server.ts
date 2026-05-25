import { redirect } from '@sveltejs/kit';
import { people } from '$lib/data/people';
import peopleData from '$lib/data/people.json';
import type { PageServerLoad } from './$types';

const redirects = (peopleData.meta?.redirects ?? {}) as Record<string, string>;

export const load: PageServerLoad = ({ params }) => {
	const target = redirects[params.id];
	if (target) redirect(301, `/people/${target}`);
};

export function entries() {
	return [
		...people.map((person) => ({ id: person.id })),
		...Object.keys(redirects).map((id) => ({ id })),
	];
}
