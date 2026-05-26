import { forgejoWebRepo, githubWebRepo, radicleWebRepo } from '$lib/data/placeholder';

export type JoinOption = {
	key: 'attend' | 'event' | 'online' | 'write' | 'books' | 'space' | 'fork';
	href: string;
	icon: 'meeting' | 'event' | 'online' | 'write' | 'book' | 'space' | 'fork';
	external?: boolean;
	mirrors?: { label: string; href: string }[];
};

export const joinOptions: JoinOption[] = [
	{ key: 'attend', href: '/events',    icon: 'meeting' },
	{ key: 'event',  href: '/find-us',   icon: 'event' },
	{ key: 'online', href: '/find-us',   icon: 'online' },
	{ key: 'write',  href: '/find-us',   icon: 'write' },
	{ key: 'books',  href: '/books',     icon: 'book' },
	{ key: 'space',  href: '/find-us',   icon: 'space' },
	{
		key: 'fork',
		href: forgejoWebRepo,
		icon: 'fork',
		external: true,
		mirrors: [
			{ label: 'radicle', href: radicleWebRepo },
			{ label: 'github',  href: githubWebRepo },
		],
	},
];
