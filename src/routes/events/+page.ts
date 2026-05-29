import {
	enrichEventForList,
	events as eventsSource,
	latestEventsRevision,
} from '$lib/data/events';
import { getLocale } from '$lib/paraglide/runtime';

export async function load() {
	const locale = getLocale();
	const today = new Date().toISOString().slice(0, 10);
	const sorted = [...eventsSource].sort((a, b) => b.date.localeCompare(a.date));

	const upcoming = sorted
		.filter((e) => e.date >= today)
		.reverse()
		.map((event) => enrichEventForList(event, locale));

	const past = sorted
		.filter((e) => e.date < today)
		.map((event) => enrichEventForList(event, locale));

	return {
		upcoming,
		past,
		latestRevision: latestEventsRevision(),
	};
}
