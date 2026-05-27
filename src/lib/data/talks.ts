import talksData from './talks.json';
import { peopleById } from './people';

export type TalkVideo = {
	platform: 'youtube' | string;
	url: string;
	duration: string;
	videoId: string;
};

export type Talk = {
	id: string;
	title: string;
	date: string;
	language: string;
	description: string;
	video: TalkVideo;
	speakers: string[];
	thumbnail: string;
	thumbnailUrl?: string;
	thumbnailVersions?: Record<string, string>;
	collection: string;
	event: string;
	project: string;
	source: string;
};

export type TalkCollection = {
	id: string;
	title: string;
	source: string;
	event: string;
	project: string;
	count: number;
	history: { hash: string; date: string; author: string; message: string }[];
	contributors: { name: string }[];
};

export type TalkSpeakerRef = {
	name: string;
	personId?: string;
};

export const talks: Talk[] = (talksData as { talks: Talk[] }).talks;
export const talksById = new Map(talks.map((t) => [t.id, t]));
export const talkCollections: TalkCollection[] = (talksData as { collections: TalkCollection[] }).collections ?? [];

export function getTalksByPersonId(personId: string): Talk[] {
	return talks.filter((t) =>
		(t.speakers ?? []).some((s) => {
			const ref = parseSpeaker(s);
			return ref.personId === personId;
		})
	);
}

export function latestTalksRevision(): { hash: string; date: string } | null {
	return (talksData as any).meta?.talks?.latestCommit ?? (talksData as any).meta?.commit ?? null;
}

export function parseSpeaker(raw: string): TalkSpeakerRef {
	const parts = raw.split('|').map((p) => p.trim());
	if (parts.length >= 2) {
		return { name: parts[0], personId: parts[1] };
	}
	// bare lowercase-hyphen id (e.g. "amir-taaki") — look up display name from people dataset
	if (/^[a-z0-9-]+$/.test(raw)) {
		const person = peopleById.get(raw);
		return { name: person?.name ?? raw, personId: raw };
	}
	return { name: raw };
}

export function talkThumbnailUrl(talk: Talk): string | null {
	return talk.thumbnailUrl ?? null;
}

export function talkThumbnailSrcset(talk: Talk): string | undefined {
	if (!talk.thumbnailVersions) return undefined;
	return Object.entries(talk.thumbnailVersions)
		.map(([w, url]) => `${url} ${w}`)
		.join(', ');
}

export function talkYoutubeEmbedUrl(talk: Talk): string | null {
	if (talk.video?.platform === 'youtube' && talk.video.videoId) {
		return `https://www.youtube-nocookie.com/embed/${talk.video.videoId}`;
	}
	return null;
}
