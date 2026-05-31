import peopleData from './people.json';

export type PersonRefKey = 'web' | 'twitter' | 'github' | 'nostr' | string;

export type ImageVersions = Record<string, string>;

export type Person = {
	id: string;
	name: string;
	avatar?: string;
	avatarVersions?: ImageVersions;
	avatarsAlt?: string[];
	avatarsAltVersions?: (ImageVersions | null)[];
	caption?: string;
	altNames?: string[];
	refs?: Record<PersonRefKey, string>;
	description?: string;
	born?: string;
	died?: string;
	history?: { hash: string; date: string; author: string; message: string }[];
};

export type LatestRevision = {
	hash: string;
	date: string;
};

const PEOPLE_BASE = 'https://people.data.heterarchy.fyi';

export const people = (peopleData as { people: Person[] }).people;
export const peopleById = new Map(people.map((person) => [person.id, person]));

const peopleByContributorKey = new Map<string, Person>();

function contributorKey(value: string): string {
	return value.trim().toLowerCase();
}

for (const person of people) {
	const keys = new Set<string>([
		person.id,
		person.name,
		...(person.altNames ?? []),
		...(person.refs?.github ? [person.refs.github] : []),
	]);
	for (const key of keys) {
		if (key) peopleByContributorKey.set(contributorKey(key), person);
	}
}

/** Match git/forgejo author strings from dataset history to a people profile. */
export function personForContributor(author: string): Person | null {
	const key = contributorKey(author);
	return peopleByContributorKey.get(key) ?? null;
}

export function personPath(id: string): string {
	return `/people/${id}`;
}

export function personAvatarUrl(person: Person): string | null {
	if (!person.avatar) return null;
	return `${PEOPLE_BASE}/people/${person.id}/${person.avatar}`;
}

export function personAvatarAltUrl(person: Person): string | null {
	if (!person.avatarsAlt?.length) return null;
	return `${PEOPLE_BASE}/people/${person.id}/${person.avatarsAlt[0]}`;
}

export function personAvatarAltUrls(person: Person): string[] {
	return (person.avatarsAlt ?? []).map((f) => `${PEOPLE_BASE}/people/${person.id}/${f}`);
}

export function imageSrcset(versions: ImageVersions | null | undefined): string | undefined {
	if (!versions) return undefined;
	return Object.entries(versions)
		.map(([w, url]) => `${url} ${w}`)
		.join(', ');
}

export function latestPeopleRevision(): LatestRevision | null {
	return peopleData.meta?.people?.latestCommit ?? peopleData.meta?.commit ?? null;
}
