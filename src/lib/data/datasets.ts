export type CollectionConfig = {
	name: string;
	changelogPath: string;
};

export type DatasetConfig = {
	id: string;
	path: string;
	endpoint: string;
	endpointLabel: string;
	repository: string;
	github?: string;
	radicle?: string;
	collections: CollectionConfig[];
};

const RADICLE_SEED = 'seed.heterarchy.fyi';

export function radicleUrl(rid: string): string {
	return `https://radicle.network/nodes/${RADICLE_SEED}/${rid}`;
}

export const datasetConfigs: DatasetConfig[] = [
	{
		id: 'glossary',
		path: '/glossary',
		endpoint: 'https://glossary.data.heterarchy.fyi/',
		endpointLabel: 'https://glossary.data.heterarchy.fyi/',
		repository: 'https://git.heterarchy.fyi/heterarchy-society/glossary',
		github: 'https://github.com/heterarchy-society/glossary',
		radicle: radicleUrl('rad:zuqmPxXRzgtN1cVzHq8PyMomWTLu'),
		collections: [{ name: 'terms', changelogPath: '/glossary/changelog' }]
	},
	{
		id: 'writings',
		path: '/writings',
		endpoint: 'https://writings.data.heterarchy.fyi/',
		endpointLabel: 'https://writings.data.heterarchy.fyi/',
		repository: 'https://git.heterarchy.fyi/heterarchy-society/writings',
		github: 'https://github.com/heterarchy-society/writings',
		radicle: radicleUrl('rad:z249Sc89XWm4sfthkCJM4Jp4foQdk'),
		collections: [{ name: 'writings', changelogPath: '/writings/changelog' }]
	},
	{
		id: 'books',
		path: '/books',
		endpoint: 'https://books.data.heterarchy.fyi/index.json',
		endpointLabel: 'https://books.data.heterarchy.fyi/',
		repository: 'https://git.heterarchy.fyi/heterarchy-society/books',
		github: 'https://github.com/heterarchy-society/books',
		radicle: radicleUrl('rad:zFYLWerMS7reLb372d84oxqy9ZQH'),
		collections: [{ name: 'books', changelogPath: '/books/changelog' }]
	},
	{
		id: 'people',
		path: '/people',
		endpoint: 'https://people.data.heterarchy.fyi/',
		endpointLabel: 'https://people.data.heterarchy.fyi/',
		repository: 'https://git.heterarchy.fyi/heterarchy-society/people',
		github: 'https://github.com/heterarchy-society/people',
		radicle: radicleUrl('rad:z65FF84dMSHS7KcTTJ3PHxktg1Ma'),
		collections: [{ name: 'people', changelogPath: '/people/changelog' }]
	},
	{
		id: 'talks',
		path: '/talks',
		endpoint: 'https://talks.data.heterarchy.fyi/',
		endpointLabel: 'https://talks.data.heterarchy.fyi/',
		repository: 'https://git.heterarchy.fyi/heterarchy-society/talks',
		github: 'https://github.com/heterarchy-society/talks',
		collections: [{ name: 'talks', changelogPath: '/talks/changelog' }]
	},
	{
		id: 'events',
		path: '/events',
		endpoint: 'https://events.data.heterarchy.fyi/events-index.json',
		endpointLabel: 'https://events.data.heterarchy.fyi/',
		repository: 'https://git.heterarchy.fyi/heterarchy-society/events',
		github: 'https://github.com/heterarchy-society/events',
		collections: [{ name: 'events', changelogPath: '/events/changelog' }]
	}
];
