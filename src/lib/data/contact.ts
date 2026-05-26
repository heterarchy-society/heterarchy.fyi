import { forgejoOrg, githubOrg, radicleOrg } from '$lib/data/placeholder';

export type ContactChannel = {
	label: string;
	value: string;
	href?: string;
	external?: boolean;
	logo?: string;
	mirror?: boolean;
};

export type OfflineVenue = ContactChannel & {
	city: string;
	country: string;
};

export const contactIntro = {
	title: 'Kde nás najdete?',
	lead: 'Jsme tam, kde jsou naši lidé.'
};

export const onlineChannels: ContactChannel[] = [
	{
		label: 'Git: Forgejo',
		value: forgejoOrg.replace('https://', ''),
		href: forgejoOrg,
		external: true
	},
	{
		label: 'Git: Radicle',
		value: radicleOrg.replace('https://radicle.network/nodes/', ''),
		href: radicleOrg,
		external: true,
		mirror: true
	},
	{
		label: 'Git: GitHub',
		value: githubOrg.replace('https://', ''),
		href: githubOrg,
		external: true,
		mirror: true
	}
];

export const offlineIntro = 'Nemáme vlastní prostor. Aktuálně nás hostují tyto místa:';

export const offlineVenues: OfflineVenue[] = [
	{
		label: 'Bordel',
		value: 'bordel.wtf',
		city: 'Praha',
		country: 'Česko',
		href: 'https://bordel.wtf',
		external: true
	}
];

export const contactMeta = {
	title: 'Kde nás najdete? — The Heterarchy Society',
	description: 'Kde najdete The Heterarchy Society — online kanály a git.'
};
