import { datasetConfigs } from '$lib/data/datasets';

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	const datasets = await Promise.all(
		datasetConfigs.map(async (config) => {
			try {
				const res = await fetch(config.endpoint);
				const data = await res.json();
				const meta = data.meta ?? {};

				const collections = config.collections.map((col) => ({
					name: col.name,
					changelogPath: col.changelogPath,
					count: meta[col.name]?.count ?? null,
					commit: meta[col.name]?.latestCommit?.hash ?? null,
					updatedAt: meta[col.name]?.latestCommit?.date ?? null
				}));

				// meta.commit is the dataset-level commit; fall back to latest collection commit
				const datasetCommit = meta.commit ?? null;
				const latestCollection = collections.reduce(
					(latest: (typeof collections)[number] | null, col) => {
						if (!col.updatedAt) return latest;
						if (!latest?.updatedAt) return col;
						return col.updatedAt > latest.updatedAt ? col : latest;
					},
					null
				);

				return {
					id: config.id,
					endpoint: config.endpoint,
					endpointLabel: config.endpointLabel,
					repository: config.repository,
					radicle: config.radicle ?? null,
					commit: datasetCommit?.hash ?? latestCollection?.commit ?? null,
					updatedAt: datasetCommit?.date ?? latestCollection?.updatedAt ?? null,
					totalCount: collections.reduce((sum, col) => sum + (col.count ?? 0), 0) || null,
					collections
				};
			} catch {
				return {
					id: config.id,
					endpoint: config.endpoint,
					endpointLabel: config.endpointLabel,
					repository: config.repository,
					radicle: config.radicle ?? null,
					commit: null,
					updatedAt: null,
					totalCount: null,
					collections: config.collections.map((col) => ({
						name: col.name,
						changelogPath: col.changelogPath,
						count: null,
						commit: null,
						updatedAt: null
					}))
				};
			}
		})
	);

	return { datasets };
}
