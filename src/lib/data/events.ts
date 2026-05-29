import eventsData from './events.json';
import { peopleById } from './people';
import type { ImageVersions } from './people';
import { imageSrcset } from './people';

export type { ImageVersions };

export type EventImageType = 'logo' | 'poster' | 'square' | 'banner';

export type EventImage = {
	path: string;
	type: EventImageType;
};

export type EventPlace = {
	city: string;
	country: string;
	name?: string;
};

export type EventRefs = {
	web?: string;
	luma?: string;
	meetup?: string;
	[key: string]: string | undefined;
};

export type Event = {
	id: string;
	name: string;
	date: string;
	startTime?: string;
	endTime?: string;
	place?: EventPlace;
	venues?: { name: string }[];
	major?: boolean;
	project?: string;
	days?: number;
	seq?: number;
	refs?: EventRefs;
	imgs?: EventImage[];
	imgVersions?: Record<string, ImageVersions>;
	speakers?: string[];
	organizers?: string[];
	langs?: string[];
	caption?: string;
	description?: string;
	aftermovie?: string;
	history?: { hash: string; date: string; author: string; message: string }[];
};

export type ResolvedSpeaker =
	| { type: 'person'; id: string; name: string }
	| { type: 'text'; label: string };

export type LatestRevision = {
	hash: string;
	date: string;
};

const EVENTS_BASE = 'https://events.data.heterarchy.fyi';

export const events: Event[] = (eventsData as { events: Event[] }).events;
export const eventsById = new Map(events.map((event) => [event.id, event]));

export function eventPath(id: string): string {
	return `/events/${id}`;
}

export function eventImageUrl(event: Event, img: EventImage): string {
	return `${EVENTS_BASE}/events/${event.id}/${img.path}`;
}

export function eventImageSrcset(event: Event, img: EventImage): string | undefined {
	return imageSrcset(event.imgVersions?.[img.path]);
}

export function pickCardImage(event: Event): EventImage | undefined {
	const imgs = event.imgs ?? [];
	return (
		imgs.find((i) => i.type === 'square') ??
		imgs.find((i) => i.type === 'logo') ??
		imgs[0]
	);
}

export function pickHeroImage(event: Event): EventImage | undefined {
	const imgs = event.imgs ?? [];
	return (
		imgs.find((i) => i.type === 'banner') ??
		imgs.find((i) => i.type === 'poster') ??
		imgs[0]
	);
}

export function resolveSpeaker(s: string): ResolvedSpeaker {
	const slug = s.toLowerCase().replace(/\s+/g, '-');
	if (peopleById.has(slug)) {
		return { type: 'person', id: slug, name: peopleById.get(slug)!.name };
	}
	if (peopleById.has(s)) {
		return { type: 'person', id: s, name: peopleById.get(s)!.name };
	}
	return { type: 'text', label: s };
}

export function formatEventDate(date: string, locale = 'en'): string {
	const d = new Date(date + 'T12:00:00');
	if (isNaN(d.getTime())) return date;
	return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatEventTimeRange(event: Event, locale = 'en'): string | null {
	if (!event.startTime) return null;
	const start = new Date(event.startTime);
	if (isNaN(start.getTime())) return null;
	const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
	const startStr = start.toLocaleTimeString(locale, opts);
	if (!event.endTime) return startStr;
	const end = new Date(event.endTime);
	if (isNaN(end.getTime())) return startStr;
	return `${startStr}–${end.toLocaleTimeString(locale, opts)}`;
}

export function formatEventPlace(place: EventPlace | undefined, locale = 'en'): string | null {
	if (!place) return null;
	let country = place.country.toUpperCase();
	try {
		country = new Intl.DisplayNames([locale], { type: 'region' }).of(country) ?? country;
	} catch {
		/* keep code */
	}
	return `${place.city}, ${country}`;
}

export function formatEventLocation(event: Event, locale = 'en'): string | null {
	const place = formatEventPlace(event.place, locale);
	if (place && event.venues?.length) {
		return `${event.venues[0].name}, ${place}`;
	}
	if (place) return place;
	if (event.venues?.length) return event.venues.map((v) => v.name).join(' · ');
	return null;
}

export function eventPrimaryHref(event: Event): string | undefined {
	return event.refs?.web ?? (event.refs?.luma ? `https://lu.ma/${event.refs.luma}` : undefined);
}

export function latestEventsRevision(): LatestRevision | null {
	return eventsData.meta?.events?.latestCommit ?? eventsData.meta?.commit ?? null;
}

export function getFeaturedEvent(): Event | undefined {
	const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));
	return sorted.find((e) => e.major) ?? sorted[0];
}

export const featuredEvent = getFeaturedEvent();

export type EventListItem = Event & {
	cardImageUrl: string | null;
	cardImageSrcset: string | undefined;
	locationLabel: string | null;
	dateLabel: string;
};

export function enrichEventForList(event: Event, locale = 'en'): EventListItem {
	const cardImg = pickCardImage(event);
	return {
		...event,
		cardImageUrl: cardImg ? eventImageUrl(event, cardImg) : null,
		cardImageSrcset: cardImg ? eventImageSrcset(event, cardImg) : undefined,
		locationLabel: formatEventLocation(event, locale),
		dateLabel: formatEventDate(event.date, locale),
	};
}
