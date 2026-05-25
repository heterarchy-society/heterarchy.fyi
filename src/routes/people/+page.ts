import { latestPeopleRevision, people as peopleSource, personAvatarUrl } from '$lib/data/people';

export async function load() {
	const people = [...peopleSource]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((person) => ({
			...person,
			avatarUrl: personAvatarUrl(person)
		}));

	return {
		people,
		latestRevision: latestPeopleRevision()
	};
}
