import { latestPeopleRevision, people as peopleSource, personAvatarUrl, personAvatarAltUrl, imageSrcset } from '$lib/data/people';

export async function load() {
	const people = [...peopleSource]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((person) => ({
			...person,
			avatarUrl: personAvatarUrl(person),
			avatarSrcset: imageSrcset(person.avatarVersions),
			avatarAltUrl: personAvatarAltUrl(person),
			avatarAltSrcset: imageSrcset(person.avatarsAltVersions?.[0] ?? undefined),
		}));

	return {
		people,
		latestRevision: latestPeopleRevision()
	};
}
