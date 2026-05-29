import glossaryData from '$lib/data/glossary.json';
import termHistoryCsv from '$lib/data/term-history.csv?raw';
import { localDateLabel, computeTermForDate, parseHistory } from '$lib/data/term-of-day-core.js';

type GlossaryTerm = { id: string; name: string; excerpt?: string; description?: string };

const allTerms = (glossaryData as { terms: GlossaryTerm[] }).terms;
export const termPool = allTerms.filter((t) => t.excerpt || t.description);

const termById = new Map(termPool.map((t) => [t.id, t]));
const history = parseHistory(termHistoryCsv) as Record<string, string>;
export const termHistoryDates = new Set(Object.keys(history));

export function termForDate(date: Date): GlossaryTerm {
	const lockedId = history[localDateLabel(date)];
	return (lockedId ? termById.get(lockedId) : null) ?? computeTermForDate(termPool, date);
}
