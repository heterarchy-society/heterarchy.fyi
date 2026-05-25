import { error } from '@sveltejs/kit';
import { bookAuthorRefs, libraryBooks } from '$lib/data/library';
import { peopleById, personAvatarUrl, personAvatarAltUrls, imageSrcset } from '$lib/data/people';
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
			avatarSrcset: imageSrcset(person.avatarVersions),
			avatarAltUrls: personAvatarAltUrls(person),
			avatarAltSrcsets: (person.avatarsAltVersions ?? []).map((v) => imageSrcset(v ?? undefined)),
		},
		books: libraryBooks.filter((book) => bookAuthorRefs(book).some((author) => author.personId === person.id)),
		writings: getWritingsByPersonId(person.id),
	};
}

