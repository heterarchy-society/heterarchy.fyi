import { error } from '@sveltejs/kit';
import { getGlossaryHistoryTerm } from '$lib/server/glossary';
import { datasetConfigs } from '$lib/data/datasets';
import type { PageServerLoad } from './$types';

const glossaryRepository = datasetConfigs.find((d) => d.id === 'glossary')!.repository;

export const load: PageServerLoad = ({ params }) => {
	const term = getGlossaryHistoryTerm(params.id);

	if (!term) {
		error(404, 'Term not found');
	}

	return { term, termId: term.id, repository: glossaryRepository };
};
