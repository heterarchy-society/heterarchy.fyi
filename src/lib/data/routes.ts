import { localizeUrl } from '$lib/i18n';
import type { Locale } from '$lib/locale-storage';
import { datasetConfigs } from '$lib/data/datasets';

const datasetById = new Map(datasetConfigs.map((d) => [d.id, d]));

export function datasetUrl(collection: string, id: string, locale?: Locale): string {
	const config = datasetById.get(collection);
	if (!config) return '';
	return localizeUrl(`${config.path}/${id}`, locale);
}

export const knownCollections = new Set(datasetConfigs.map((d) => d.id));

export function glossaryUrl(id: string, locale?: Locale): string {
	return datasetUrl('glossary', id, locale);
}
