export type ContactChannel = {
	label: string;
	value: string;
	href?: string;
	external?: boolean;
};

export const contactIntro = {
	title: 'Kontakt',
	lead: 'Nemáme kancelář ani recepci. Jsme tam, kde jsou naši lidé — online i na setkáních.',
	note: 'Na obecné dotazy odpovídáme, když stihneme. Na urgentní věci spíš online kanály níže — e-mail a Matrix brzy.'
};

export const contactChannels: ContactChannel[] = [
	{
		label: 'E-mail',
		value: 'TBD'
	},
	{
		label: 'Matrix',
		value: 'TBD'
	},
	{
		label: 'Git',
		value: 'github.com/heterarchy-society',
		href: 'https://github.com/heterarchy-society',
		external: true
	}
];

export const contactMeta = {
	title: 'Kontakt — The Heterarchy Society',
	description: 'Jak se spojit s The Heterarchy Society — online kanály a git.'
};
