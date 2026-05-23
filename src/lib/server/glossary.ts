import glossaryDataSource from '$lib/data/glossary.json';

type GlossaryTerm = {
	id: string;
	name: string;
	type?: string;
	keywords?: string[];
	resources?: Record<string, any>[];
	description?: string;
	translations?: Record<string, Record<string, unknown>>;
	resolvedLinks?: { key?: string; target?: string | null }[];
	history?: Record<string, any>[];
	[key: string]: any;
};

type GlossaryIndexTerm = Omit<GlossaryTerm, 'description' | 'resources' | 'history'> & {
	translations?: Record<string, Record<string, unknown>>;
	historyCount: number;
	lastEditDate: string | null;
	excerpt: string;
};

type GlossarySummaryTerm = Pick<GlossaryTerm, 'id' | 'name' | 'type' | 'translations'>;

type GlossarySpotlightTerm = GlossarySummaryTerm & {
	excerpt: string;
	resolvedLinks?: GlossaryTerm['resolvedLinks'];
};

const glossaryData = glossaryDataSource as { meta: unknown; terms: GlossaryTerm[] };

function csSlug(term: GlossaryTerm): string | null {
	return (term.translations?.cs?.slug as string | undefined) ?? null;
}

function stripTranslationDetails(translations: GlossaryTerm['translations']) {
	if (!translations) return undefined;

	return Object.fromEntries(
		Object.entries(translations).map(([locale, translation]) => {
			const { description, ...summary } = translation as Record<string, unknown>;
			return [locale, { ...summary, excerpt: typeof description === 'string' ? description.split('\n\n')[0] : undefined }];
		})
	);
}

function stripTranslationContent(translations: GlossaryTerm['translations']) {
	if (!translations) return undefined;

	return Object.fromEntries(
		Object.entries(translations).map(([locale, translation]) => {
			const { description, excerpt, ...summary } = translation as Record<string, unknown>;
			return [locale, summary];
		})
	);
}

function stripTranslationLabels(translations: GlossaryTerm['translations']) {
	if (!translations) return undefined;

	return Object.fromEntries(
		Object.entries(translations).map(([locale, translation]) => {
			const { slug, name, type } = translation as Record<string, unknown>;
			return [locale, { slug, name, type }];
		})
	);
}

function stripTranslationExcerpts(translations: GlossaryTerm['translations']) {
	if (!translations) return undefined;

	return Object.fromEntries(
		Object.entries(translations).map(([locale, translation]) => {
			const { slug, name, type, description } = translation as Record<string, unknown>;
			return [
				locale,
				{
					slug,
					name,
					type,
					excerpt: typeof description === 'string' ? description.split('\n\n')[0] : undefined
				}
			];
		})
	);
}

function toIndexTerm(term: GlossaryTerm): GlossaryIndexTerm {
	const { description, resources, history, translations, ...summary } = term;
	const latestHistory = Array.isArray(history) ? (history[0] as { date?: string } | undefined) : undefined;

	return {
		...summary,
		translations: stripTranslationDetails(translations),
		historyCount: Array.isArray(history) ? history.length : 0,
		lastEditDate: latestHistory?.date ?? null,
		excerpt: description ? description.split('\n\n')[0] : '',
	};
}

function toListTerm({ id, name, type, translations }: GlossaryTerm): GlossarySummaryTerm {
	return {
		id,
		name,
		type,
		translations: stripTranslationLabels(translations)
	};
}

function toSpotlightTerm({ id, name, type, description, translations, resolvedLinks }: GlossaryTerm): GlossarySpotlightTerm {
	return {
		id,
		name,
		type,
		translations: stripTranslationExcerpts(translations),
		excerpt: description ? description.split('\n\n')[0] : '',
		resolvedLinks
	};
}

function getSpotlightTerms(): GlossarySpotlightTerm[] {
	const terms = glossaryData.terms.map(toSpotlightTerm).filter((term) => term.excerpt);
	const targetCount = 16;
	const step = Math.max(1, Math.floor(terms.length / targetCount));
	return terms.filter((_, index) => index % step === 0).slice(0, targetCount);
}

export function findGlossaryTerm(idOrSlug: string): GlossaryTerm | undefined {
	return glossaryData.terms.find((term) => term.id === idOrSlug || csSlug(term) === idOrSlug);
}

export function getGlossaryIndex(): { meta: unknown; terms: GlossarySummaryTerm[]; spotlightTerms: GlossarySpotlightTerm[] } {
	return {
		meta: glossaryData.meta,
		terms: glossaryData.terms.map(toListTerm),
		spotlightTerms: getSpotlightTerms()
	};
}

export function getGlossaryIndexTerms(): GlossaryIndexTerm[] {
	return glossaryData.terms.map(toIndexTerm);
}

export function getGlossarySummaryTerms(ids: Iterable<string>): GlossarySummaryTerm[] {
	const wanted = new Set(ids);
	return glossaryData.terms
		.filter((term) => wanted.has(term.id))
		.map(toSummaryTerm);
}

function toSummaryTerm({ id, name, type, translations }: GlossaryTerm): GlossarySummaryTerm {
	return {
		id,
		name,
		type,
		translations: stripTranslationContent(translations)
	};
}

export function getGlossaryBacklinks(termId: string): GlossarySummaryTerm[] {
	return glossaryData.terms
		.filter((term) => term.resolvedLinks?.some((link) => link.target === termId))
		.map(toSummaryTerm);
}

export function getGlossaryEntries(): { id: string }[] {
	return glossaryData.terms.flatMap((term) => {
		const slug = csSlug(term);
		return slug && slug !== term.id
			? [{ id: term.id }, { id: slug }]
			: [{ id: term.id }];
	});
}

export function getGlossaryHistoryTerm(idOrSlug: string) {
	const term = findGlossaryTerm(idOrSlug);
	if (!term) return undefined;

	return {
		id: term.id,
		name: term.name,
		type: term.type,
		translations: stripTranslationDetails(term.translations),
		history: term.history ?? []
	};
}
