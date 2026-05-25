import peopleData from './people.json';

export type PersonRefKey = 'web' | 'twitter' | 'github' | 'nostr' | string;

export type Person = {
	id: string;
	name: string;
	avatar?: string;
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

export function personPath(id: string): string {
	return `/people/${id}`;
}

export function personAvatarUrl(person: Person): string | null {
	if (!person.avatar) return null;
	return `${PEOPLE_BASE}/people/${person.id}/${person.avatar}`;
}

export function latestPeopleRevision(): LatestRevision | null {
	return peopleData.meta?.people?.latestCommit ?? peopleData.meta?.commit ?? null;
}
