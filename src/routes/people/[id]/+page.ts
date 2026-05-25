import { error } from '@sveltejs/kit';
import { bookAuthorRefs, libraryBooks } from '$lib/data/library';
import { people, peopleById, personAvatarUrl, personAvatarAltUrls } from '$lib/data/people';
import { getWritingsByPersonId } from '$lib/data/writings';
import type { PageLoad } from './$types';

export function load({ params }: Parameters<PageLoad>[0]) {
	const person = peopleById.get(params.id);

	if (!person) {
		error(404, 'Person not found');
	}

	return {
		person: {
			...person,
			avatarUrl: personAvatarUrl(person),
			avatarAltUrls: personAvatarAltUrls(person)
		},
		books: libraryBooks.filter((book) => bookAuthorRefs(book).some((author) => author.personId === person.id)),
		writings: getWritingsByPersonId(person.id),
	};
}

export function entries() {
	return people.map((person) => ({ id: person.id }));
}
