import { error } from '@sveltejs/kit';
import { bookAuthorRefs, libraryBooks } from '$lib/data/library';
import { peopleById, personAvatarUrl, personAvatarAltUrls, imageSrcset } from '$lib/data/people';
import { getWritingsByPersonId } from '$lib/data/writings';
import { getTalksByPersonId } from '$lib/data/talks';
import { getEventsByPersonId, enrichEventForList } from '$lib/data/events';
import { datasetConfigs } from '$lib/data/datasets';
import type { PageLoad } from './$types';

const peopleRepository = datasetConfigs.find((d) => d.id === 'people')!.repository;

export function load({ params, data }: Parameters<PageLoad>[0]) {
	const person = peopleById.get(params.id);

	if (!person) {
		error(404, 'Person not found');
	}

	return {
		descriptionHtml: data.descriptionHtml,
		person: {
			...person,
			avatarUrl: personAvatarUrl(person),
			avatarSrcset: imageSrcset(person.avatarVersions),
			avatarAltUrls: personAvatarAltUrls(person),
			avatarAltSrcsets: (person.avatarsAltVersions ?? []).map((v) => imageSrcset(v ?? undefined)),
		},
		books: libraryBooks.filter((book) => bookAuthorRefs(book).some((author) => author.personId === person.id)),
		writings: getWritingsByPersonId(person.id),
		talks: getTalksByPersonId(person.id),
		events: getEventsByPersonId(person.id)
			.sort((a, b) => b.date.localeCompare(a.date))
			.map((e) => enrichEventForList(e)),
		repository: peopleRepository,
	};
}

