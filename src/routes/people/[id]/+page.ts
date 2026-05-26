import { error } from '@sveltejs/kit';
import { bookAuthorRefs, libraryBooks } from '$lib/data/library';
import { peopleById, personAvatarUrl, personAvatarAltUrls, imageSrcset } from '$lib/data/people';
import { getWritingsByPersonId } from '$lib/data/writings';
import { datasetConfigs } from '$lib/data/datasets';
import type { PageLoad } from './$types';

const peopleRepository = datasetConfigs.find((d) => d.id === 'people')!.repository;

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
		repository: peopleRepository,
	};
}

