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

export const signalGroup: ContactChannel = {
	label: 'Signal',
	value: 'signal.heterarchy.fyi',
	href: 'https://signal.heterarchy.fyi',
	external: true,
};

export const onlineChannels: ContactChannel[] = [signalGroup];

export const gitChannels: ContactChannel[] = [
	{
		label: 'Forgejo',
		value: forgejoOrg.replace('https://', ''),
		href: forgejoOrg,
		external: true
	},
	{
		label: 'Radicle',
		value: radicleOrg.replace('https://radicle.network/nodes/', ''),
		href: radicleOrg,
		external: true,
		mirror: true
	},
	{
		label: 'GitHub',
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
