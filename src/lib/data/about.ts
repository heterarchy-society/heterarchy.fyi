export const aboutHero = {
	lines: [
		{ text: 'Žádní vůdci.', muted: false },
		{ text: 'Žádné vrstvy.', muted: false },
		{ text: 'Jen propojení.', muted: true }
	],
	intro:
		'Zkoumáme technologie a způsoby organizace, které nám umožňují žít a tvořit bez hierarchií. Společně. Otevřeně. Suverénně.',
	cta: { label: 'zapojit se', href: '/zapojit-se' }
};

export type ValueItem = {
	title: string;
	description: string;
	icon: 'circle' | 'star' | 'squares' | 'cluster';
};

export const values: ValueItem[] = [
	{
		title: 'Ne hierarchicky',
		description: 'Rozhodujeme společně. Nikdo nevede.',
		icon: 'circle'
	},
	{
		title: 'Suverénně',
		description: 'Vlastníme své nástroje, data i rozhodnutí.',
		icon: 'star'
	},
	{
		title: 'Otevřeně',
		description: 'Vše je forkovatelné. Sdílíme a stavíme spolu.',
		icon: 'squares'
	},
	{
		title: 'Lokálně & globálně',
		description: 'Scházíme se všude. Patříme nikam.',
		icon: 'cluster'
	}
];

export const aboutMeta = {
	title: 'O nás — The Heterarchy Society',
	description:
		'Manifesto The Heterarchy Society — komunita kolem suverénních technologií, decentralizovaných systémů a nehierarchických forem organizace.'
};
