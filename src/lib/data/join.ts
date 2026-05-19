import { LUMA_AI_SVOBODA } from '$lib/data/events';

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
	lead: 'Nemáme členy, přihlášky ani výbor. Stačí přijít, něco přinést nebo něco rozšířit.',
	note: 'Každý formát je dobrovolný. Nikdo nic nečeká — ale vždy je kam přispět.'
};

export const joinOptions: JoinOption[] = [
	{
		label: 'Přijď na setkání',
		description:
			'Nejjednodušší vstup. Poslouchej, ptej se, představ svůj projekt. Registrace není povinná, ale pomůže nám s prostorem.',
		href: '/udalosti',
		linkLabel: '→ nadcházející události',
		icon: 'meeting'
	},
	{
		label: 'Uspořádej událost',
		description:
			'Workshop, diskuse, setkání — navrhni formát a termín. My pomůžeme s propagací, ty s obsahem.',
		href: '/kontakt',
		linkLabel: '→ napiš nám',
		icon: 'event'
	},
	{
		label: 'Připoj se online',
		description:
			'Matrix, e-mail nebo git — kanály bez hierarchie. Ptej se, sdílej odkazy, navrhni téma na další večer.',
		href: '/kontakt',
		linkLabel: '→ kontakt',
		icon: 'online'
	},
	{
		label: 'Napiš text',
		description:
			'Essej, poznámka, záznam z workshopu. Bez redakční rady — texty procházejí komunitou, ne schvalováním shora.',
		href: '/kontakt',
		linkLabel: '→ kontakt',
		icon: 'write'
	},
	{
		label: 'Přečti knihu / daruj do knihovny',
		description:
			'Vypůjč si knihu v LibertyLoftu, nebo přines vlastní na poličku. Katalog je online.',
		href: '/knihovna',
		linkLabel: '→ knihovna',
		icon: 'book'
	},
	{
		label: 'Nabídni prostor',
		description:
			'Máš klub, hackerspace nebo salonek? Hostujeme se u vás. Prostor nás nedefinuje, ale setkání ano.',
		href: '/kontakt',
		linkLabel: '→ napiš nám',
		icon: 'space'
	},
	{
		label: 'Forkni a uprav',
		description:
			'Web, manifesto, nástroje — vše je forkovatelné. Pokud něco chybí, přidej to. Pokud něco nefunguje, oprav to.',
		href: 'https://github.com',
		linkLabel: '→ git',
		icon: 'fork',
		external: true
	}
];

export const joinMeta = {
	title: 'Zapojit se — The Heterarchy Society',
	description:
		'Jak se zapojit do The Heterarchy Society — setkání, komunita, texty a forkovatelné nástroje.'
};
