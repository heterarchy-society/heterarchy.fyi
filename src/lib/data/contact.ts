export type ContactChannel = {
	label: string;
	value: string;
	href?: string;
	external?: boolean;
	logo?: string;
};

export const contactIntro = {
	title: 'Kde nás najdete?',
	lead: 'Jsme tam, kde jsou naši lidé.'
};

export const onlineChannels: ContactChannel[] = [
	{
		label: 'Git',
		value: 'github.com/heterarchy-society',
		href: 'https://github.com/heterarchy-society',
		external: true
	}
];

export const offlineIntro = 'Nemáme vlastní prostor. Aktuálně nás hostují tyto místa:';

export const offlineVenues: ContactChannel[] = [
	{
		label: 'LibertyLoft',
		value: 'libertyloft.cz',
		href: 'https://libertyloft.cz',
		external: true,
		logo: '/logo-libertyloft.png'
	}
];

export const contactMeta = {
	title: 'Kde nás najdete? — The Heterarchy Society',
	description: 'Kde najdete The Heterarchy Society — online kanály a git.'
};
