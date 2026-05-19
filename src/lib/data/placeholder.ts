export type NavItem = {
	label: string;
	href: string;
};

export type TextArticle = {
	category: string;
	date: string;
	title: string;
	excerpt: string;
	href: string;
};


export type FooterLink = {
	label: string;
	href: string;
};

export const navItems: NavItem[] = [
	{ label: 'domů', href: '/' },
	{ label: 'události', href: '/udalosti' },
	{ label: 'knihovna', href: '/knihovna' },
	{ label: 'zapojit se', href: '/zapojit-se' }
];

export const hero = {
	tagline:
		'Komunita kolem suverénních technologií, paralelních struktur a nehierarchických forem organizace.',
	ctas: [
		{ label: 'manifesto', href: '/#manifesto' },
		{ label: 'zapojit se', href: '/zapojit-se' }
	]
};

export const latestTexts: TextArticle[] = [
	{
		category: 'Esej',
		date: '14. 5. 2026',
		title: 'Proč potřebujeme paralelní instituce',
		excerpt:
			'Hierarchie není přirozený stav — je to zvyk. A zvyk se dá změnit, pokud začneme budovat jinak.',
		href: '/texty/proc-potrebujeme-paralelni-instituce'
	},
	{
		category: 'Technologie',
		date: '10. 5. 2026',
		title: 'Self-hosting jako akt svobody',
		excerpt:
			'Vlastní server není geekovská extravagance. Je to způsob, jak si vzít zpět kontrolu nad daty.',
		href: '/texty/self-hosting-jako-akt-svobody'
	},
	{
		category: 'Poznámka',
		date: '3. 5. 2026',
		title: 'Co znamená heterarchie v praxi',
		excerpt:
			'Nehierarchická organizace neznamená chaos. Moc proudí podle kontextu a kompetence.',
		href: '/texty/co-znamena-heterarchie-v-praxi'
	},
	{
		category: 'Esej',
		date: '26. 4. 2026',
		title: 'Gravitace institucí',
		excerpt:
			'Hnutí za svobodu se mění v instituce. Nástroje osvobození se stávají platformami.',
		href: '/texty/gravitace-instituci'
	}
];

export const footerLinks: FooterLink[] = [
	{ label: 'kontakt', href: '/kontakt' },
	{ label: 'newsletter', href: '#' },
	{ label: 'git', href: '#' },
	{ label: 'rss', href: '#' }
];

export const siteMeta = {
	title: 'The Heterarchy Society',
	description:
		'Komunita kolem suverénních technologií, decentralizovaných systémů a nehierarchických forem organizace.',
	version: '0.1',
	footerNotice: 'The Heterarchy Society · vše je forkovatelné'
};
