export type NavItem = {
	label: string;
	href: string;
};

export type FeaturedEvent = {
	title: string;
	date: string;
	time: string;
	location: string;
	description: string;
	href: string;
	posterLines: string[];
};

export type UpcomingEvent = {
	date: string;
	title: string;
	location: string;
	href: string;
};

export type TextArticle = {
	category: string;
	date: string;
	title: string;
	excerpt: string;
	href: string;
};

export type LibraryLink = {
	label: string;
	href: string;
	icon: 'book' | 'asterisk' | 'wrench' | 'archive';
};

export type FooterLink = {
	label: string;
	href: string;
};

export const navItems: NavItem[] = [
	{ label: 'o nás', href: '#' },
	{ label: 'události', href: '#' },
	{ label: 'texty', href: '#' },
	{ label: 'knihovna', href: '#' },
	{ label: 'zapojit se', href: '#' }
];

export const hero = {
	tagline:
		'Komunita kolem suverénních technologií, paralelních struktur a nehierarchických forem organizace.',
	ctas: [
		{ label: 'nejbližší událost', href: '#udalosti' },
		{ label: 'nové texty', href: '#texty' }
	]
};

export const featuredEvent: FeaturedEvent = {
	title: 'AI x svoboda vol. I',
	date: '20. 5. 2026',
	time: '17:00–21:00',
	location: 'LibertyLoft, Praha',
	description:
		'Umělá inteligence mění svět rychleji, než jsme schopni reflektovat. Jak si zachovat svobodu v éře algoritmů?',
	href: '#',
	posterLines: ['AI X', 'SVOBODA', 'VOL. I']
};

export const upcomingEvents: UpcomingEvent[] = [
	{
		date: '20. 5.',
		title: 'AI x svoboda vol. I',
		location: 'LibertyLoft',
		href: '#'
	},
	{
		date: '3. 6.',
		title: 'Čtecí kruh: Ivan Illich…',
		location: 'Kampus Hybernská',
		href: '#'
	},
	{
		date: '18. 6.',
		title: 'Workshop: Self-hosting…',
		location: 'online',
		href: '#'
	}
];

export const latestTexts: TextArticle[] = [
	{
		category: 'Esej',
		date: '14. 5. 2026',
		title: 'Proč potřebujeme paralelní instituce',
		excerpt:
			'Hierarchie není přirozený stav — je to zvyk. A zvyk se dá změnit, pokud začneme budovat jinak.',
		href: '#'
	},
	{
		category: 'Technologie',
		date: '10. 5. 2026',
		title: 'Self-hosting jako akt svobody',
		excerpt:
			'Vlastní server není geekovská extravagance. Je to způsob, jak si vzít zpět kontrolu nad daty.',
		href: '#'
	},
	{
		category: 'Poznámka',
		date: '3. 5. 2026',
		title: 'Co znamená heterarchie v praxi',
		excerpt:
			'Nehierarchická organizace neznamená chaos. Moc proudí podle kontextu a kompetence.',
		href: '#'
	},
	{
		category: 'Esej',
		date: '26. 4. 2026',
		title: 'Gravitace institucí',
		excerpt:
			'Hnutí za svobodu se mění v instituce. Nástroje osvobození se stávají platformami.',
		href: '#'
	}
];

export const libraryLinks: LibraryLink[] = [
	{ label: 'Doporučené knihy', href: '#', icon: 'book' },
	{ label: 'Zásady a principy', href: '#', icon: 'asterisk' },
	{ label: 'Nástroje a návody', href: '#', icon: 'wrench' },
	{ label: 'Archiv textů', href: '#', icon: 'archive' }
];

export const footerLinks: FooterLink[] = [
	{ label: 'kontakt', href: '#' },
	{ label: 'newsletter', href: '#' },
	{ label: 'git', href: '#' },
	{ label: 'rss', href: '#' }
];

export const siteMeta = {
	title: 'The Heterarchy Society',
	description:
		'Komunita kolem suverénních technologií, decentralizovaných systémů a nehierarchických forem organizace.',
	version: '0.1'
};
