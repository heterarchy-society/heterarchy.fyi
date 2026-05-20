export type JoinOption = {
	label: string;
	description: string;
	href: string;
	linkLabel: string;
	icon: 'meeting' | 'event' | 'online' | 'write' | 'book' | 'space' | 'fork';
	external?: boolean;
};

export const joinIntro = {
	title: 'Zapojit se',
	lead: 'Přijď, přines něco, nebo něco uprav.',
	note: null
};

export const joinOptions: JoinOption[] = [
	{
		label: 'Přijď na setkání',
		description:
			'Poslouchej, ptej se, představ projekt. Registrace pomůže s prostorem, ale není nutná.',
		href: '/udalosti',
		linkLabel: '→ nadcházející události',
		icon: 'meeting'
	},
	{
		label: 'Uspořádej událost',
		description:
			'Navrhni téma, formát a termín. Prostor a propagace se dohodnou.',
		href: '/platformy',
		linkLabel: '→ napiš nám',
		icon: 'event'
	},
	{
		label: 'Připoj se online',
		description:
			'Jsme na více místech. Ptej se, sdílej, navrhni téma.',
		href: '/platformy',
		linkLabel: '→ kde nás najdete?',
		icon: 'online'
	},
	{
		label: 'Napiš text',
		description:
			'Esej, poznámka, záznam ze setkání. Texty procházejí komunitou.',
		href: '/platformy',
		linkLabel: '→ kde nás najdete?',
		icon: 'write'
	},
	{
		label: 'Knihovna',
		description:
			'Vypůjč si knihu v LibertyLoftu nebo přines vlastní. Katalog je online.',
		href: '/knihovna',
		linkLabel: '→ knihovna',
		icon: 'book'
	},
	{
		label: 'Nabídni prostor',
		description:
			'Máš klub, hackerspace nebo salonek? Ozvěme se.',
		href: '/platformy',
		linkLabel: '→ napiš nám',
		icon: 'space'
	},
	{
		label: 'Forkni a uprav',
		description:
			'Web, manifesto, nástroje — vše je na gitu. Chybí něco? Přidej to.',
		href: 'https://github.com/heterarchy-society/heterarchy.cz',
		linkLabel: '→ git',
		icon: 'fork',
		external: true
	}
];

export const joinMeta = {
	title: 'Zapojit se — The Heterarchy Society',
	description:
		'Jak se zapojit do The Heterarchy Society — setkání, komunita, texty a nástroje.'
};
