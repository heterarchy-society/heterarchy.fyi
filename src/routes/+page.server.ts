import glossaryData from '$lib/data/glossary.json';
import { getLocale, localizeUrl } from '$lib/i18n';
import { renderMarkdownInline } from '$lib/markdown';
import { termForDate } from '$lib/data/term-of-day';

type GlossaryTerm = {
	id: string;
	name: string;
	type?: string | null;
	description?: string;
	excerpt?: string;
	translations?: Record<string, { slug?: string; name?: string; type?: string | null; description?: string; excerpt?: string }>;
	resolvedLinks?: { key: string; link: string | null; target: string | null }[];
};

function displayName(term: GlossaryTerm, locale: string): string {
	return term.translations?.[locale]?.name ?? term.name;
}

function displayType(term: GlossaryTerm, locale: string): string | null {
	return term.translations?.[locale]?.type ?? term.type ?? null;
}

function termPath(term: GlossaryTerm, locale: string): string {
	const id = term.translations?.[locale]?.slug ?? term.id;
	return localizeUrl(`/glossary/${id}`);
}

function renderExcerpt(term: GlossaryTerm, termsById: Map<string, GlossaryTerm>, locale: string): string {
	const translated = term.translations?.[locale] ?? null;
	const excerpt =
		translated?.excerpt ?? translated?.description?.split('\n\n')[0] ?? term.excerpt ?? term.description?.split('\n\n')[0];
	if (!excerpt) return '';

	const resolved = new Map<string, string>();
	for (const link of term.resolvedLinks ?? []) {
		if (!link.target) continue;
		resolved.set((link.link ?? link.key).toLowerCase(), link.target);
		resolved.set(link.key.toLowerCase(), link.target);
	}

	const markdown = excerpt.replace(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/g, (_full, targetKey: string, label?: string) => {
		const key = targetKey.trim();
		const text = label?.trim() || key;
		const target = resolved.get(key.toLowerCase()) ?? (termsById.has(key) ? key : null);
		const targetTerm = target ? termsById.get(target) : null;
		return targetTerm ? `[${text}](${termPath(targetTerm, locale)})` : text;
	});

	return renderMarkdownInline(markdown);
}

function randomGlossaryItem(locale: string) {
	const terms = (glossaryData as { terms: GlossaryTerm[] }).terms;
	const termsById = new Map(terms.map((term) => [term.id, term]));

	const term = termForDate(new Date()) as typeof terms[number];

	return {
		id: term.id,
		name: displayName(term, locale),
		type: displayType(term, locale),
		href: termPath(term, locale),
		excerptHtml: renderExcerpt(term, termsById, locale),
	};
}

export function load() {
	return {
		glossaryItem: randomGlossaryItem(getLocale()),
	};
}
