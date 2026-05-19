export type EventItem = {
	date: string;
	time: string;
	title: string;
	location: string;
	description: string;
	href?: string;
	posterUrl?: string;
};

export const events: EventItem[] = [
	{
		date: '20. 5. 2026',
		time: '17:00–21:00',
		title: 'AI x svoboda vol. I',
		location: 'LibertyLoft, Praha',
		description:
			'Umělá inteligence mění svět rychleji, než jsme schopni reflektovat. Jak si zachovat svobodu v éře algoritmů? Večer diskusí, příkladů a praktických nástrojů.',
		href: 'https://luma.com/tsdo0qej',
		posterUrl:
			'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=400,height=400/uploads/x4/c5e5796e-b40a-44eb-890a-462df2a0deba.png'
	},
	{
		date: 'Červen 2026',
		time: '17:00–21:00',
		title: 'AI x svoboda vol. II (TBD)',
		location: 'TBD, Praha',
		description:
			'Umělá inteligence mění svět rychleji, než jsme schopni reflektovat. Jak si zachovat svobodu v éře algoritmů? Večer diskusí, příkladů a praktických nástrojů.',
	}
];

export const featuredEvent = events[0];

/** Všechny události pro sidebar na homepage. */
export const upcomingEvents = events;

export const eventsIntro = {
	lead: 'Diskuse, workshopy a setkání'
};

export const eventsMeta = {
	title: 'Události — The Heterarchy Society',
	description: 'Nadcházející setkání The Heterarchy Society — diskuse, workshopy a setkání.'
};
