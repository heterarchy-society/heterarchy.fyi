export type ContactChannel = {
	label: string;
	value: string;
	href?: string;
	external?: boolean;
	logo?: string;
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
		label: 'Radicle',
		value: 'seed.heterarchy.fyi',
		href: 'https://radicle.network/nodes/seed.heterarchy.fyi',
		external: true
	},
	{
		label: 'GitHub',
		value: 'github.com/heterarchy-society',
		href: 'https://github.com/heterarchy-society',
		external: true
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
