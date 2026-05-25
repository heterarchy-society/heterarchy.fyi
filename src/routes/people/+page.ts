import { latestPeopleRevision, people as peopleSource, personAvatarUrl, personAvatarAltUrl } from '$lib/data/people';

export async function load() {
	const people = [...peopleSource]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((person) => ({
			...person,
			avatarUrl: personAvatarUrl(person),
			avatarAltUrl: personAvatarAltUrl(person)
		}));

	return {
		people,
		latestRevision: latestPeopleRevision()
	};
}
