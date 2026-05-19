import type { LibraryBook } from './library-types';

const SOVENG = 'https://sovereignengineering.io';
const PP = 'https://parallelpolis.info';

function cover(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${SOVENG}${normalized}`;
}

export const libraryBooks: LibraryBook[] = [
	{
		id: 'sovereign-individual',
		title: 'The Sovereign Individual',
		author: 'James Dale Davidson & William Rees-Mogg',
		year: '1997',
		coverUrl: cover('/images/books/the-sovereign-individual.jpg'),
		description:
			'Mastering the Transition to the Information Age. Klasická teze o tom, jak digitální technologie mění vztah jednotlivce a státu.',
		language: ['en'],
		formats: ['ebook'],
		physical: false,
		links: [
			{
				href: 'https://archive.org/details/the-sovereign-individual',
				label: '→ číst na archive.org',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'cathedral-bazaar',
		title: 'The Cathedral and the Bazaar',
		author: 'Eric S. Raymond',
		year: '1999',
		coverUrl: cover('/images/books/the-cathedral-and-the-bazaar.jpg'),
		description:
			'Musings on Linux and Open Source by an Accidental Revolutionary. Eseje o otevřeném vývoji a decentralizované spolupráci.',
		language: ['en'],
		formats: ['web'],
		physical: false,
		links: [
			{
				href: 'http://www.catb.org/~esr/writings/cathedral-bazaar/',
				label: '→ číst online',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'free-software-free-society',
		title: 'Free Software, Free Society',
		author: 'Richard Stallman',
		year: '2002',
		coverUrl: cover('/images/books/free-software-free-society.jpg'),
		description:
			'Selected Essays of Richard M. Stallman. When we speak of free software, we are referring to freedom, not price.',
		language: ['en'],
		formats: ['pdf', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.gnu.org/philosophy/fsfs/rms-essays.pdf',
				label: '→ stáhnout PDF',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'property-freedom-society',
		title: 'Property, Freedom, and Society',
		author: 'Hans-Hermann Hoppe',
		year: '2009',
		coverUrl: cover('/images/books/property-freedom-and-society.jpg'),
		description: 'Essays in Honor of Hans-Hermann Hoppe.',
		language: ['en'],
		formats: ['pdf', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://cdn.mises.org/Property,%20Freedom,%20and%20Society%20Essays%20in%20Honor%20of%20Hans-Hermann%20Hoppe_2.pdf',
				label: '→ stáhnout PDF',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'against-intellectual-property',
		title: 'Against Intellectual Property',
		author: 'Stephan Kinsella',
		year: '2008',
		coverUrl: cover('/images/books/Against_Intellectual_Propery-Kinsella.jpg'),
		description:
			'Would a libertarian society recognize patents as legitimate? What about copyright?',
		language: ['en'],
		formats: ['ebook', 'web'],
		physical: false,
		links: [
			{
				href: 'https://mises.org/library/book/against-intellectual-property',
				label: '→ číst na mises.org',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'lodging-wayfaring-men',
		title: 'A Lodging of Wayfaring Men',
		author: 'Paul Rosenberg',
		year: '2007',
		coverUrl: cover('/images/books/a_lodging_of_wayfaring_men.jpg'),
		description:
			'A novel that explores the concept of freedom-seekers creating an alternative society on the Internet.',
		language: ['en'],
		formats: ['pdf', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://anarplex.sirion.io/hosted/files/A_Lodging_of_Wayfaring_Men.pdf',
				label: '→ stáhnout PDF',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'endurance-shackleton',
		title: "Endurance: Shackleton's Incredible Voyage",
		author: 'Alfred Lansing',
		year: '1959',
		coverUrl: cover('/images/books/Endurance-Shackletons_incredible_voyage.jpg'),
		description:
			"A tale of survival by Shackleton and all 27 of his men for over a year on the ice-bound Antarctic seas — a story of leadership without hierarchy.",
		language: ['en'],
		formats: ['ebook'],
		physical: false,
		links: [
			{
				href: 'https://archive.org/details/enduranceshackle0000lans_n0v5',
				label: '→ číst na archive.org',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'finite-infinite-games',
		title: 'Finite and Infinite Games',
		author: 'James P. Carse',
		year: '1986',
		coverUrl: cover('/images/books/finite_and_infinite_games-carse.jpg'),
		description: 'A vision of life as play and possibility.',
		language: ['en'],
		formats: ['ebook'],
		physical: false,
		links: [
			{
				href: 'https://archive.org/details/finiteinfinitega00carsrich',
				label: '→ číst na archive.org',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'network-state',
		title: 'The Network State',
		author: 'Balaji Srinivasan',
		year: '2022',
		coverUrl: cover('/images/books/the_network_state-balaji.jpg'),
		description: 'How to start a new country.',
		language: ['en'],
		formats: ['web', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://thenetworkstate.com/',
				label: '→ číst online',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'singularity-is-near',
		title: 'The Singularity Is Near',
		author: 'Ray Kurzweil',
		year: '2005',
		coverUrl: cover('/images/books/the-singularity-is-near.jpg'),
		description:
			'When Humans Transcend Biology. A deep dive into exponential technological growth and the coming merger of human and machine intelligence.',
		language: ['en'],
		formats: ['ebook'],
		physical: false,
		links: [
			{
				href: 'https://archive.org/details/singularityisnea00kurz',
				label: '→ číst na archive.org',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'superintelligence',
		title: 'Superintelligence',
		author: 'Nick Bostrom',
		year: '2014',
		coverUrl: cover('/images/books/superintelligence.jpg'),
		description:
			'Paths, Dangers, Strategies. What happens when machines surpass human intelligence, and how do we navigate the transition?',
		language: ['en'],
		formats: ['ebook'],
		physical: false,
		links: [
			{
				href: 'https://archive.org/details/superintelligenc0000bost',
				label: '→ číst na archive.org',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'alignment-problem',
		title: 'The Alignment Problem',
		author: 'Brian Christian',
		year: '2020',
		coverUrl: cover('/images/books/the-alignment-problem.jpg'),
		description:
			'Machine Learning and Human Values. How do we ensure the systems we build actually do what we intend?',
		language: ['en'],
		formats: ['web', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://brianchristian.org/the-alignment-problem/',
				label: '→ více o knize',
				external: true
			}
		],
		source: { name: 'Sovereign Engineering', href: `${SOVENG}/books` }
	},
	{
		id: 'extreme-privacy',
		title: 'Extreme Privacy: What It Takes to Disappear in America',
		author: 'Michael Bazzell',
		year: '2024',
		coverUrl:
			'https://atlas.pp0.co/img/books/m/7b39c48699f8d60054e7f3dd6e715b624ab86d6199218c8f538c7dd2fa2d104f.webp',
		description:
			'Michael Bazzell has helped hundreds of celebrities, billionaires, and everyday citizens disappear completely from public view. His latest work focuses on proactive privacy — not just cleaning up what is already online.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.amazon.com/Extreme-Privacy-What-Takes-Disappear-dp-B0DCJN61GF/dp/B0DCJN61GF',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: `${PP}/b/extreme-privacy-by-michael-bazzel`,
				label: '→ Parallel Polis',
				external: true
			}
		],
		source: { name: 'Parallel Polis', href: `${PP}/books` }
	},
	{
		id: 'means-of-control',
		title:
			'Means of Control: How the Hidden Alliance of Tech and Government Is Creating a New American Surveillance State',
		author: 'Byron Tau',
		year: '2024',
		coverUrl:
			'https://atlas.pp0.co/img/books/m/eadaa19a2561653d9c45bbfb8a50b6cffb283a5a73f4a9f40639d296cf84a53c.webp',
		description:
			'You are being surveilled right now. An exposé of how the U.S. government allied with data brokers, tech companies, and advertisers to monitor us through the phones we carry and the devices in our homes.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.amazon.com/Means-Control-Alliance-Government-Surveillance/dp/0593443225',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: `${PP}/b/means-of-control-byron-tau`,
				label: '→ Parallel Polis',
				external: true
			}
		],
		source: { name: 'Parallel Polis', href: `${PP}/books` }
	},
	{
		id: 'tracers-in-the-dark',
		title: 'Tracers in the Dark: The Global Hunt for the Crime Lords of Cryptocurrency',
		author: 'Andy Greenberg',
		year: '2022',
		coverUrl:
			'https://atlas.pp0.co/img/books/m/665538eabf5203587fd727ac9f847ad6df5bce02b8d1aa8fd00422d5f6d9b5ac.webp',
		description:
			'From the author of Sandworm: investigators who cracked the Bitcoin blockchain, exposing once-anonymous realms of money, drugs, and violence.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.amazon.com/Tracers-Dark-Global-Crime-Cryptocurrency/dp/0385548095',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: `${PP}/b/tracers-in-the-dark-by-andy-greenberg`,
				label: '→ Parallel Polis',
				external: true
			}
		],
		source: { name: 'Parallel Polis', href: `${PP}/books` }
	},
	{
		id: 'stuck-on-the-platform',
		title: 'Stuck on the Platform: Reclaiming the Internet',
		author: 'Geert Lovink',
		year: '2022',
		coverUrl:
			'https://atlas.pp0.co/img/books/m/512419cfb075aa92727ab85e2d1985c83b50e278204a201c5033abbf86e5c7d7.webp',
		description:
			'We’re all trapped. No matter how hard you try to delete apps from your phone, the power of seduction draws you back. What happens when your home office starts to feel like a call center?',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.amazon.com/Stuck-Platform-Reclaiming-Geert-Lovink/dp/9493246086',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: `${PP}/b/stuck-on-the-platform-by-geert-lovink`,
				label: '→ Parallel Polis',
				external: true
			}
		],
		source: { name: 'Parallel Polis', href: `${PP}/books` }
	},
	{
		id: 'cypherpunk-ethics',
		title: 'Cypherpunk Ethics: Radical Ethics for the Digital Age',
		author: 'Patrick D. Anderson',
		year: '2022',
		coverUrl:
			'https://atlas.pp0.co/img/books/m/0c07e975616712b8f6e4f7d76c5d7578e7dd23e7b0d0957b7424a7dc40a52758.webp',
		description:
			'Explores the moral worldview of the cypherpunks — a movement that advocates strong cryptography to defend privacy and promote institutional transparency.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.amazon.com/Cypherpunk-Ethics-Radical-Digital-Routledge/dp/1032113596',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: `${PP}/b/cypherpunk-ethics-by-patrick-d-anderson`,
				label: '→ Parallel Polis',
				external: true
			}
		],
		source: { name: 'Parallel Polis', href: `${PP}/books` }
	},
	{
		id: 'psychopolitics',
		title: 'Psychopolitics: Neoliberalism and New Technologies of Power',
		author: 'Byung-Chul Han',
		year: '2017',
		coverUrl:
			'https://atlas.pp0.co/img/books/m/ce880103d6b2015d4f63adbb1cb7d6091dc2d7aa5a28d6259fc316fd0dce93d2.webp',
		description:
			'Exploring how neoliberalism has discovered the productive force of the psyche.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.amazon.com/Psychopolitics-Neoliberalism-New-Technologies-Power/dp/1784785776',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: `${PP}/b/psycho-politics-by-byung-chul-han`,
				label: '→ Parallel Polis',
				external: true
			}
		],
		source: { name: 'Parallel Polis', href: `${PP}/books` }
	},
	{
		id: 'dark-matters',
		title: 'Dark Matters: On the Surveillance of Blackness',
		author: 'Simone Browne',
		year: '2015',
		coverUrl:
			'https://atlas.pp0.co/img/books/m/6bf98c0777c00862386c8bb75f95d110808b26c876ff51bea790a54698d3855a.webp',
		description:
			'Simone Browne locates the conditions of blackness as a key site through which surveillance is practiced, narrated, and resisted.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.amazon.com/Dark-Matters-Surveillance-Simone-Browne/dp/0822359383',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: `${PP}/b/dark-matters-by-simone-browne`,
				label: '→ Parallel Polis',
				external: true
			}
		],
		source: { name: 'Parallel Polis', href: `${PP}/books` }
	},
	{
		id: 'forest-passage',
		title: 'The Forest Passage',
		author: 'Ernst Jünger',
		year: '2013',
		coverUrl:
			'https://atlas.pp0.co/img/books/m/3ece937597b88f9c04f30b6923b2ee65c77e8c52221417cb25d28a53bef4e2f5.webp',
		description:
			'Ernst Jünger explores the possibility of resistance: how the independent thinker can withstand and oppose the power of the omnipresent state.',
		language: ['en', 'de'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.amazon.com/Forest-Passage-Ernst-J%C3%BCnger/dp/0914386492',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: `${PP}/b/forrest-passage-by-ernst-junger`,
				label: '→ Parallel Polis',
				external: true
			}
		],
		source: { name: 'Parallel Polis', href: `${PP}/books` }
	},
	{
		id: 'praxeology-of-privacy',
		title: 'The Praxeology of Privacy',
		author: 'Max Hillebrand',
		year: '2026',
		coverUrl: '/books/praxeology-of-privacy.jpg',
		description:
			'The state cannot steal what it cannot see. A synthesis of Austrian economics and cypherpunk cryptography — why privacy matters and the engineering that makes it survivable.',
		language: ['en'],
		formats: ['pdf', 'ebook', 'print'],
		physical: false,
		links: [
			{
				href: 'https://pay.towardsliberty.com/Storage/c38551e1-9fc8-44f8-b295-8de7773546f4',
				label: '→ stáhnout PDF (zdarma)',
				external: true
			},
			{
				href: 'https://pay.towardsliberty.com/Storage/cc3cfa79-3e83-4a2f-be25-5ec7f5e17001',
				label: '→ EPUB',
				external: true
			},
			{
				href: 'https://www.amazon.de/dp/B0H1L1H1GM',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: 'https://pay.towardsliberty.com/apps/v5yU4xADsJJjxF3foYPDPFd1Snj/pos',
				label: '→ Towards Liberty',
				external: true
			}
		],
		source: {
			name: 'Towards Liberty',
			href: 'https://pay.towardsliberty.com/apps/v5yU4xADsJJjxF3foYPDPFd1Snj/pos'
		}
	},
	{
		id: 'farewell-to-westphalia',
		title: 'Farewell to Westphalia: Crypto Sovereignty and Post-Nation-State Governance',
		author: 'Jarrad Hope & Peter Ludlow',
		year: '2025',
		coverUrl: '/books/farewell-to-westphalia.png',
		description:
			'What comes after the 400-year-old nation-state system? The book explores what may succeed nation states — from cyberstates to internet movements — and argues that decentralised communities and blockchain governance are already taking root.',
		language: ['en'],
		formats: ['pdf', 'ebook', 'print', 'web'],
		physical: false,
		links: [
			{
				href: 'https://logos.co/assets/Farewell%20to%20Westphalia%20(Jarrad%20Hope%20and%20Peter%20Ludlow)%20-%20FOSS%20edition.pdf',
				label: '→ stáhnout PDF (zdarma)',
				external: true
			},
			{
				href: 'https://arxiv.org/pdf/2510.09840',
				label: '→ arXiv',
				external: true
			},
			{
				href: 'https://www.amazon.com/Farewell-Westphalia-Sovereignty-Post-Nation-State-Governance/dp/B0FQ3694VJ',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: 'https://logos.co/farewell-to-westphalia',
				label: '→ Logos',
				external: true
			}
		],
		source: { name: 'Logos', href: 'https://logos.co/farewell-to-westphalia' }
	},
	{
		id: 'anarchokapitalismus',
		title: 'Anarchokapitalismus',
		author: 'Urza',
		year: '2015',
		coverUrl: '/books/anarchokapitalismus.webp',
		description:
			'První česká kniha o anarchokapitalismu — od vzácných zdrojů a cen přes peníze, školství a zdravotnictví až po soudnictví, armádu a boření mýtů.',
		language: ['cs'],
		formats: ['pdf', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.mises.cz/database/literatura/69.pdf',
				label: '→ stáhnout PDF',
				external: true
			},
			{
				href: 'https://www.mises.cz/database/literatura/69.epub',
				label: '→ EPUB',
				external: true
			},
			{
				href: 'https://www.mises.cz/database/literatura/69.mobi',
				label: '→ MOBI',
				external: true
			},
			{
				href: 'https://www.mises.cz/literatura/anarchokapitalismus-69.aspx',
				label: '→ Mises.cz',
				external: true
			}
		],
		source: { name: 'Mises.cz', href: 'https://www.mises.cz/literatura/anarchokapitalismus-69.aspx' }
	},
	{
		id: 'tor-collier',
		title: 'Tor: From the Dark Web to the Future of Privacy',
		author: 'Ben Collier',
		year: '2024',
		coverUrl: '/books/tor-collier.jpg',
		description:
			'A cultural and technological history of Tor — from the US Navy’s Naval Research Lab and the Cypherpunks to activists on the frontlines of digital privacy today.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://mitpress.mit.edu/9780262548182/tor/',
				label: '→ MIT Press',
				external: true
			},
			{
				href: 'https://www.amazon.com/dp/0262548184',
				label: '→ koupit (Amazon)',
				external: true
			},
			{
				href: 'https://www.goodreads.com/book/show/190855053-tor',
				label: '→ Goodreads',
				external: true
			}
		],
		source: { name: 'MIT Press', href: 'https://mitpress.mit.edu/9780262548182/tor/' }
	}
];
