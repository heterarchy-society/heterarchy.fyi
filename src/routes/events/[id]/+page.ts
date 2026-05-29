import { error } from '@sveltejs/kit';
import {
	eventsById,
	eventImageUrl,
	eventImageSrcset,
	formatEventDateRange,
	formatEventDateRangeLong,
	formatEventLocation,
	formatEventTimeRange,
	pickCardImage,
	pickHeroImage,
	resolveSpeaker,
} from '$lib/data/events';
import { getTalksByEventId } from '$lib/data/talks';
import { datasetConfigs } from '$lib/data/datasets';
import { getLocale } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

const eventsRepository = datasetConfigs.find((d) => d.id === 'events')!.repository;

export const load: PageLoad = ({ params, data }) => {
	const event = eventsById.get(params.id);

	if (!event) {
		error(404, 'Event not found');
	}

	const locale = getLocale();
	const cardImg = pickCardImage(event);
	const heroImg = pickHeroImage(event);

	return {
		descriptionHtml: data.descriptionHtml,
		event: {
			...event,
			dateLabel: formatEventDateRange(event, locale),
			dateLabelLong: formatEventDateRangeLong(event, locale),
			timeLabel: formatEventTimeRange(event, locale),
			locationLabel: formatEventLocation(event, locale),
			cardImageUrl: cardImg ? eventImageUrl(event, cardImg) : null,
			cardImageSrcset: cardImg ? eventImageSrcset(event, cardImg) : undefined,
			heroImageUrl: heroImg ? eventImageUrl(event, heroImg) : null,
			heroImageSrcset: heroImg ? eventImageSrcset(event, heroImg) : undefined,
			heroImageType: heroImg?.type ?? null,
		},
		speakers: (event.speakers ?? []).map(resolveSpeaker),
		talks: getTalksByEventId(event.id),
		repository: eventsRepository,
	};
};
