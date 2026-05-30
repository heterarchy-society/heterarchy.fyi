import eventsData from './events.json';
import { peopleById } from './people';
import { firstParagraph } from '$lib/text';
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

export function getEventsByPersonId(personId: string): Event[] {
	return events.filter((e) =>
		(e.speakers ?? []).some((s) => {
			const resolved = resolveSpeaker(s);
			return resolved.type === 'person' && resolved.id === personId;
		})
	);
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

/** Last calendar day of the event (inclusive when `days` is set). */
export function eventEndDate(event: Event): string | undefined {
	const days = event.days != null ? Number(event.days) : NaN;
	let endFromDays: string | undefined;
	if (!Number.isNaN(days) && days > 1) {
		const end = new Date(event.date + 'T12:00:00');
		end.setDate(end.getDate() + days - 1);
		endFromDays = end.toLocaleDateString('en-CA');
	}
	const endFromTime = event.endTime?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
	const candidates = [endFromDays, endFromTime && endFromTime > event.date ? endFromTime : undefined].filter(
		Boolean
	) as string[];
	if (candidates.length === 0) return undefined;
	return candidates.sort().at(-1);
}

export function formatEventDateRange(event: Event, locale = 'en'): string {
	const end = eventEndDate(event);
	if (!end || end === event.date) return formatEventDate(event.date, locale);

	const startD = new Date(event.date + 'T12:00:00');
	const endD = new Date(end + 'T12:00:00');
	if (isNaN(startD.getTime()) || isNaN(endD.getTime())) return formatEventDate(event.date, locale);

	const sameMonth =
		event.date.slice(0, 7) === end.slice(0, 7);
	const sameYear = event.date.slice(0, 4) === end.slice(0, 4);

	if (sameMonth) {
		const dayStart = startD.toLocaleDateString(locale, { day: 'numeric' });
		const dayEnd = endD.toLocaleDateString(locale, { day: 'numeric' });
		const monthYear = endD.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
		return `${dayStart}–${dayEnd} ${monthYear}`;
	}
	if (sameYear) {
		const a = startD.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
		const b = endD.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
		return `${a} – ${b}`;
	}
	return `${formatEventDate(event.date, locale)} – ${formatEventDate(end, locale)}`;
}

/** Short range for compact lists, e.g. "4–6 Oct" or "4 Oct". */
export function formatEventDateRangeCompact(event: Event, locale = 'en'): string {
	const end = eventEndDate(event);
	const startD = new Date(event.date + 'T12:00:00');
	if (isNaN(startD.getTime())) return event.date;

	if (!end || end === event.date) {
		return startD.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
	}

	const endD = new Date(end + 'T12:00:00');
	if (isNaN(endD.getTime())) {
		return startD.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
	}

	const sameMonth = event.date.slice(0, 7) === end.slice(0, 7);
	if (sameMonth) {
		const dayStart = startD.toLocaleDateString(locale, { day: 'numeric' });
		const month = endD.toLocaleDateString(locale, { month: 'short' });
		const dayEnd = endD.toLocaleDateString(locale, { day: 'numeric' });
		return `${dayStart}–${dayEnd} ${month}`;
	}

	const a = startD.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
	const b = endD.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
	return `${a} – ${b}`;
}

/** Long range with weekday on the start day (upcoming section). */
export function formatEventDateRangeLong(event: Event, locale = 'en'): string {
	const end = eventEndDate(event);
	const startD = new Date(event.date + 'T12:00:00');
	if (isNaN(startD.getTime())) return event.date;

	if (!end || end === event.date) {
		return startD.toLocaleDateString(locale, {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	}

	const endD = new Date(end + 'T12:00:00');
	const startLong = startD.toLocaleDateString(locale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	const endLong = endD.toLocaleDateString(locale, {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	return `${startLong} – ${endLong}`;
}

function dateFormatParts(d: Date, locale: string, options: Intl.DateTimeFormatOptions): Record<string, string> {
	return Object.fromEntries(
		new Intl.DateTimeFormat(locale, options)
			.formatToParts(d)
			.filter((p) => p.type !== 'literal')
			.map((p) => [p.type, p.value])
	);
}

/** Long range for upcoming lists — weekday + month, no year. */
export function formatEventDateRangeUpcoming(event: Event, locale = 'en'): string {
	const end = eventEndDate(event);
	const startD = new Date(event.date + 'T12:00:00');
	if (isNaN(startD.getTime())) return event.date;

	if (!end || end === event.date) {
		const p = dateFormatParts(startD, locale, { weekday: 'long', day: 'numeric', month: 'long' });
		return `${p.weekday}, ${p.day} ${p.month}`;
	}

	const endD = new Date(end + 'T12:00:00');
	if (isNaN(endD.getTime())) {
		const p = dateFormatParts(startD, locale, { weekday: 'long', day: 'numeric', month: 'long' });
		return `${p.weekday}, ${p.day} ${p.month}`;
	}

	if (event.date.slice(0, 7) === end.slice(0, 7)) {
		const start = dateFormatParts(startD, locale, { weekday: 'long', day: 'numeric' });
		const endPart = dateFormatParts(endD, locale, { day: 'numeric', month: 'long' });
		return `${start.weekday}, ${start.day} – ${endPart.day} ${endPart.month}`;
	}

	const start = dateFormatParts(startD, locale, { weekday: 'long', day: 'numeric', month: 'long' });
	const endPart = dateFormatParts(endD, locale, { weekday: 'long', day: 'numeric', month: 'long' });
	return `${start.weekday}, ${start.day} ${start.month} – ${endPart.weekday}, ${endPart.day} ${endPart.month}`;
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

/** Local calendar date as YYYY-MM-DD. */
export function todayYmd(): string {
	return new Date().toLocaleDateString('en-CA');
}

export function daysBetween(fromYmd: string, toYmd: string): number {
	const from = new Date(fromYmd + 'T12:00:00');
	const to = new Date(toYmd + 'T12:00:00');
	return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/** Days until start (or until end if already underway). Null when finished. */
export function eventDaysLeft(event: Event, referenceDate = todayYmd()): number | null {
	const end = eventEndDate(event) ?? event.date;
	if (referenceDate > end) return null;
	if (referenceDate < event.date) return daysBetween(referenceDate, event.date);
	return daysBetween(referenceDate, end);
}

export function isUpcomingEvent(event: Event, referenceDate = todayYmd()): boolean {
	const end = eventEndDate(event) ?? event.date;
	return end >= referenceDate;
}

/** Next upcoming event on or after `referenceDate` (default: today, local). */
export function getFeaturedEvent(referenceDate = todayYmd()): Event | undefined {
	const upcoming = [...events]
		.filter((e) => e.date >= referenceDate)
		.sort((a, b) => {
			const byDate = a.date.localeCompare(b.date);
			if (byDate !== 0) return byDate;
			return (a.startTime ?? '').localeCompare(b.startTime ?? '');
		});
	return upcoming[0];
}

export type EventListItem = Event & {
	cardImageUrl: string | null;
	cardImageSrcset: string | undefined;
	locationLabel: string | null;
	dateLabel: string;
	dateLabelCompact: string;
	dateLabelLong: string;
	/** Upcoming display — long range without year. */
	dateLabelUpcoming: string;
	/** Caption, or first paragraph of description (markdown stripped). */
	excerpt: string | null;
};

export function enrichEventForList(event: Event, locale = 'en'): EventListItem {
	const cardImg = pickCardImage(event);
	const excerpt = (event.caption ?? firstParagraph(event.description)) || null;
	return {
		...event,
		cardImageUrl: cardImg ? eventImageUrl(event, cardImg) : null,
		cardImageSrcset: cardImg ? eventImageSrcset(event, cardImg) : undefined,
		locationLabel: formatEventLocation(event, locale),
		dateLabel: formatEventDateRange(event, locale),
		dateLabelCompact: formatEventDateRangeCompact(event, locale),
		dateLabelLong: formatEventDateRangeLong(event, locale),
		dateLabelUpcoming: formatEventDateRangeUpcoming(event, locale),
		excerpt,
	};
}
