import { getGlossaryIndex } from '$lib/server/glossary';

export function load() {
	return getGlossaryIndex();
}
