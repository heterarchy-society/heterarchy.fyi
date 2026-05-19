export type ContactChannel = {
	label: string;
	value: string;
	href: string;
	external?: boolean;
};

export const contactIntro = {
	title: 'Kontakt',
	lead: 'Nemáme kancelář ani recepci. Jsme tam, kde jsou naši lidé — online i na setkáních.',
	note: 'Na obecné dotazy odpovídáme, když stihneme. Na urgentní věci se ptejte komunity na nejbližší události.'
};

export const contactChannels: ContactChannel[] = [
	{
		label: 'E-mail',
		value: 'ahoj@heterarchy.cz',
		href: 'mailto:ahoj@heterarchy.cz'
	},
	{
		label: 'Matrix',
		value: '#heterarchy:matrix.org',
		href: 'https://matrix.to/#/#heterarchy:matrix.org',
		external: true
	},
	{
		label: 'Git',
		value: 'github.com/heterarchy-society',
		href: 'https://github.com',
		external: true
	}
];

export const contactMeta = {
	title: 'Kontakt — The Heterarchy Society',
	description: 'Jak se spojit s The Heterarchy Society — e-mail, Matrix a další kanály.'
};
