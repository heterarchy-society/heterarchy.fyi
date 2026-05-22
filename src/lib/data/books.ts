import type { LibraryBook } from './library-types';

const PP = 'https://parallelpolis.info';

export const libraryBooks: LibraryBook[] = [
	{
		id: 'sovereign-individual',
		title: 'The Sovereign Individual',
		author: 'James Dale Davidson & William Rees-Mogg',
		year: '1997',
		coverUrl: '/books/sovereign-individual.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'cathedral-bazaar',
		title: 'The Cathedral and the Bazaar',
		author: 'Eric S. Raymond',
		year: '1999',
		coverUrl: '/books/cathedral-bazaar.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'free-software-free-society',
		title: 'Free Software, Free Society',
		author: 'Richard Stallman',
		year: '2002',
		coverUrl: '/books/free-software-free-society.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'property-freedom-society',
		title: 'Property, Freedom, and Society',
		author: 'Hans-Hermann Hoppe',
		year: '2009',
		coverUrl: '/books/property-freedom-society.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'against-intellectual-property',
		title: 'Against Intellectual Property',
		author: 'Stephan Kinsella',
		year: '2008',
		coverUrl: '/books/against-intellectual-property.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'lodging-wayfaring-men',
		title: 'A Lodging of Wayfaring Men',
		author: 'Paul Rosenberg',
		year: '2007',
		coverUrl: '/books/lodging-wayfaring-men.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'endurance-shackleton',
		title: "Endurance: Shackleton's Incredible Voyage",
		author: 'Alfred Lansing',
		year: '1959',
		coverUrl: '/books/endurance-shackleton.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'finite-infinite-games',
		title: 'Finite and Infinite Games',
		author: 'James P. Carse',
		year: '1986',
		coverUrl: '/books/finite-infinite-games.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'network-state',
		title: 'The Network State',
		author: 'Balaji Srinivasan',
		year: '2022',
		coverUrl: '/books/network-state.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'singularity-is-near',
		title: 'The Singularity Is Near',
		author: 'Ray Kurzweil',
		year: '2005',
		coverUrl: '/books/singularity-is-near.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'superintelligence',
		title: 'Superintelligence',
		author: 'Nick Bostrom',
		year: '2014',
		coverUrl: '/books/superintelligence.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'alignment-problem',
		title: 'The Alignment Problem',
		author: 'Brian Christian',
		year: '2020',
		coverUrl: '/books/alignment-problem.jpg',
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
		source: { name: 'Sovereign Engineering', href: 'https://sovereignengineering.io/books' }
	},
	{
		id: 'extreme-privacy',
		title: 'Extreme Privacy: What It Takes to Disappear in America',
		author: 'Michael Bazzell',
		year: '2024',
		coverUrl: '/books/extreme-privacy.webp',
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
		coverUrl: '/books/means-of-control.webp',
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
		coverUrl: '/books/tracers-in-the-dark.webp',
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
		coverUrl: '/books/stuck-on-the-platform.webp',
		description:
			"We’re all trapped. No matter how hard you try to delete apps from your phone, the power of seduction draws you back. What happens when your home office starts to feel like a call center?",
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
		coverUrl: '/books/cypherpunk-ethics.webp',
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
		coverUrl: '/books/psychopolitics.webp',
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
		coverUrl: '/books/dark-matters.webp',
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
		coverUrl: '/books/forest-passage.webp',
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
		id: 'vanishing-culture',
		title: 'Vanishing Culture: A Report on Our Fragile Cultural Record',
		author: 'Luca Messarra, Chris Freeland & Juliya Ziskina',
		year: '2026',
		coverUrl: '/books/vanishing-culture.jpg',
		description:
			'Zpráva o ohrožení veřejného přístupu ke kulturnímu dědictví v digitální době — streamovací platformy, dočasné licence, mazání webů a kyberútoky na archivy a knihovny.',
		language: ['en'],
		formats: ['pdf', 'web'],
		physical: false,
		links: [
			{
				href: 'https://archive.org/details/vanishing-culture-2026',
				label: '→ číst na archive.org',
				external: true
			}
		],
		source: { name: 'Internet Archive', href: 'https://archive.org/details/vanishing-culture-2026' }
	},
	{
		id: 'reinventing-organizations',
		title: 'Reinventing Organizations',
		author: 'Frederic Laloux',
		year: '2014',
		coverUrl: '/books/reinventing-organizations.jpg',
		description:
			'Jak fungují organizace bez šéfů, popisů práce a rozpočtů. Laloux mapuje vznik nového paradigmatu řízení — samospráva, celistvost a evoluční účel jako základ živých organizací.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.reinventingorganizations.com/',
				label: '→ web knihy',
				external: true
			}
		],
		source: { name: 'Reinventing Organizations', href: 'https://www.reinventingorganizations.com/' }
	},
	{
		id: 'animal-farm',
		title: 'Animal Farm',
		author: 'George Orwell',
		year: '1945',
		coverUrl: '/books/animal-farm.jpg',
		description:
			'Alegorická novela o revoluci, která zradí sama sebe. Zvířata svrhnou farmáře a postaví vlastní společnost — dokud se nová elita nestane k nerozeznání od té staré.',
		language: ['en'],
		formats: ['ebook', 'print'],
		physical: false,
		links: [
			{
				href: 'https://archive.org/details/animal-farm-by-george-orwell',
				label: '→ číst na archive.org',
				external: true
			}
		],
		source: { name: 'Internet Archive', href: 'https://archive.org/details/animal-farm-by-george-orwell' }
	},
	{
		id: 'agorism-21st-century',
		title: 'Agorism in the 21st Century #1',
		author: 'DarkFi (ed.)',
		year: '2022',
		coverUrl: '/books/agorism-21st-century.png',
		description:
			'Filozofický žurnál zkoumající agorismus a kryptoekonomi. Eseje o meme coinech, NFT, DeFi, DAO a zero-knowledge kryptografii optikou agoristické filozofie — od autorů jako Jaya Klara Brekke, Harry Halpin nebo Nick Land.',
		language: ['en'],
		formats: ['pdf', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://agorist.xyz/files/Agorism_XXI_I_2022.pdf',
				label: '→ stáhnout PDF',
				external: true
			},
			{
				href: 'https://agorist.xyz/files/Agorism_XXI_I_2022.epub',
				label: '→ EPUB',
				external: true
			}
		],
		source: { name: 'DarkFi', href: 'https://confoederatio.noblogs.org/post/2022/02/19/agorism-in-the-21st-century-1/' }
	},
	{
		id: 'blockchain-radicals',
		title: 'Blockchain Radicals: How Capitalism Ruined Crypto and How to Fix It',
		author: 'Joshua Dávila',
		year: '2023',
		coverUrl: '/books/blockchain-radicals.jpg',
		description:
			'Jak kapitalismus ovládl krypto — a jak ho vzít zpět. Dávila zkoumá cestu od WikiLeaks přes DeFi a dělnické kooperativy až po krypto-commons a argumentuje, že blockchain je příležitost, ne hrozba.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://repeaterbooks.com/product/blockchain-radicals-how-capitalism-ruined-crypto-and-how-to-fix-it/',
				label: '→ Repeater Books',
				external: true
			}
		],
		source: { name: 'Repeater Books', href: 'https://repeaterbooks.com/product/blockchain-radicals-how-capitalism-ruined-crypto-and-how-to-fix-it/' }
	},
	{
		id: 'word-for-world-is-forest',
		title: 'The Word for World is Forest',
		author: 'Ursula K. Le Guin',
		year: '1976',
		coverUrl: '/books/word-for-world-is-forest.jpg',
		description:
			'Novela o kolonializmu a násilí na cizí planetě — když mírový národ Athšanů povstane proti lidským dobyvatelům, zkoumá Le Guin cenu, kterou platí za opuštění vlastních hodnot. Hugo Award 1973.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://www.ursulakleguin.com/the-word-for-world-is-forest',
				label: '→ web autorky',
				external: true
			}
		],
		source: { name: 'Ursula K. Le Guin', href: 'https://www.ursulakleguin.com/the-word-for-world-is-forest' }
	},
	{
		id: 'understanding-institutional-diversity',
		title: 'Understanding Institutional Diversity',
		author: 'Elinor Ostrom',
		year: '2005',
		coverUrl: '/books/understanding-institutional-diversity.jpg',
		description:
			'Ostrom presents the IAD framework for analyzing how institutions form and govern collective action — from common-pool resources to self-organized communities. Klíčová práce o polycentriickém vládnutí a správě bez centrální autority.',
		language: ['en'],
		formats: ['pdf'],
		physical: false,
		links: [
			{
				href: 'https://wtf.tw/ref/ostrom_2005.pdf',
				label: '→ stáhnout PDF',
				external: true
			},
			{
				href: 'https://press.princeton.edu/books/paperback/9780691122380/understanding-institutional-diversity',
				label: '→ Princeton UP',
				external: true
			}
		],
		source: { name: 'Princeton University Press', href: 'https://press.princeton.edu/books/paperback/9780691122380/understanding-institutional-diversity' }
	},
	{
		id: 'platform-brutality',
		title: 'Platform Brutality: Closing Down Internet Toxicity',
		author: 'Geert Lovink',
		year: '2025',
		coverUrl: '/books/platform-brutality.png',
		description:
			'Social media no longer just distracts — it wounds. Lovink zkoumá, jak se digitální prostory staly místy toxicity a násilí, a volá po demontáži samotného principu platforem.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://valiz.nl/en/publications/platform-brutality',
				label: '→ Valiz',
				external: true
			}
		],
		source: { name: 'Valiz', href: 'https://valiz.nl/en/publications/platform-brutality' }
	},
	{
		id: 'chasing-shadows',
		title: 'Chasing Shadows',
		author: 'Ronald J. Deibert',
		year: '2025',
		coverUrl: '/books/chasing-shadows.jpg',
		description:
			'A real-life spy thriller documenting the Citizen Lab\'s investigations into cyber espionage — how authoritarian regimes exploit digital infrastructure to monitor and suppress activists, journalists, and dissidents worldwide.',
		language: ['en'],
		formats: ['print', 'ebook'],
		physical: false,
		links: [
			{
				href: 'https://chasingshadowsbook.ca/',
				label: '→ web knihy',
				external: true
			}
		],
		source: { name: 'Simon & Schuster', href: 'https://chasingshadowsbook.ca/' }
	},
	{
		id: 'tor-collier',
		title: 'Tor: From the Dark Web to the Future of Privacy',
		author: 'Ben Collier',
		year: '2024',
		coverUrl: '/books/tor-collier.jpg',
		description:
			"A cultural and technological history of Tor — from the US Navy's Naval Research Lab and the Cypherpunks to activists on the frontlines of digital privacy today.",
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
