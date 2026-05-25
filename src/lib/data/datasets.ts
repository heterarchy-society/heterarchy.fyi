export type CollectionConfig = {
	name: string;
	changelogPath: string;
};

export type DatasetConfig = {
	id: string;
	endpoint: string;
	endpointLabel: string;
	repository: string;
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
		endpoint: 'https://glossary.data.heterarchy.fyi/',
		endpointLabel: 'https://glossary.data.heterarchy.fyi/',
		repository: 'https://github.com/heterarchy-society/glossary',
		radicle: radicleUrl('rad:zuqmPxXRzgtN1cVzHq8PyMomWTLu'),
		collections: [{ name: 'terms', changelogPath: '/glossary/changelog' }]
	},
	{
		id: 'writings',
		endpoint: 'https://writings.data.heterarchy.fyi/',
		endpointLabel: 'https://writings.data.heterarchy.fyi/',
		repository: 'https://github.com/heterarchy-society/writings',
		radicle: radicleUrl('rad:z249Sc89XWm4sfthkCJM4Jp4foQdk'),
		collections: [{ name: 'writings', changelogPath: '/writings/changelog' }]
	},
	{
		id: 'books',
		endpoint: 'https://books.data.heterarchy.fyi/index.json',
		endpointLabel: 'https://books.data.heterarchy.fyi/',
		repository: 'https://github.com/heterarchy-society/books',
		collections: [{ name: 'books', changelogPath: '/books/changelog' }]
	},
	{
		id: 'people',
		endpoint: 'https://people.data.heterarchy.fyi/',
		endpointLabel: 'https://people.data.heterarchy.fyi/',
		repository: 'https://github.com/heterarchy-society/people',
		radicle: radicleUrl('rad:zFYLWerMS7reLb372d84oxqy9ZQH'),
		collections: [{ name: 'people', changelogPath: '/people/changelog' }]
	}
];
