import { getGlossaryIndex } from '$lib/server/glossary';
import {
	fetchCollectionChangelog,
	type CollectionChangelogEntry
} from '$lib/server/changelog';
import glossaryData from '$lib/data/glossary.json';
import { datasetConfigs } from '$lib/data/datasets';
import { getLocale, localizeUrl } from '$lib/i18n';

const glossaryRepository = datasetConfigs.find((d) => d.id === 'glossary')!.repository;
import { renderMarkdownInline } from '$lib/markdown';

export type ChangelogEntry = CollectionChangelogEntry;

export type Contributor = {
	name: string;
	commits: number;
	gh_username?: string;
};

function getContributors(): Contributor[] {
	const counts = new Map<string, { commits: number; gh_username?: string }>();
	for (const term of (glossaryData as any).terms) {
		for (const a of term.authors ?? []) {
			const existing = counts.get(a.name);
			if (!existing) {
				counts.set(a.name, { commits: 1, gh_username: a.gh_username });
			} else {
				existing.commits += 1;
			}
		}
	}
	return [...counts.entries()]
		.map(([name, { commits, gh_username }]) => ({ name, commits, gh_username }))
		.sort((a, b) => b.commits - a.commits);
}

function displayName(term: any, locale: string): string {
	return term.translations?.[locale]?.name ?? term.name;
}

function displayType(term: any, locale: string): string | null {
	return term.translations?.[locale]?.type ?? term.type ?? null;
}

function termPath(term: any, locale: string): string {
	const id = term.translations?.[locale]?.slug ?? term.id;
	return localizeUrl(`/glossary/${id}`);
}

function renderSpotlightExcerpt(term: any, termsById: Map<string, any>, locale: string): string {
	const translated = term.translations?.[locale] ?? null;
	const excerpt =
		translated?.excerpt ?? translated?.description?.split('\n\n')[0] ?? term.excerpt ?? term.description?.split('\n\n')[0];
	if (!excerpt) return '';

	const resolved = new Map<string, string>();
	for (const rl of (term.resolvedLinks ?? []) as { key: string; link: string | null; target: string | null }[]) {
		if (rl.target) {
			resolved.set((rl.link ?? rl.key).toLowerCase(), rl.target);
			resolved.set(rl.key.toLowerCase(), rl.target);
		}
	}

	const md = excerpt.replace(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/g, (_: string, display: string, explicit?: string) => {
		const target = resolved.get((explicit ?? display).toLowerCase());
		const targetTerm = target ? termsById.get(target) : null;
		return targetTerm ? `[${display}](${termPath(targetTerm, locale)})` : display;
	});

	return renderMarkdownInline(md);
}

function randomFallbackSpotlight(terms: any[], termsById: Map<string, any>, locale: string) {
	const pool = terms.filter((term) => term.description || Object.values(term.translations ?? {}).some((t: any) => t?.description));
	if (!pool.length) return null;
	const term = pool[Math.floor(Math.random() * pool.length)];

	return {
		id: term.id,
		name: displayName(term, locale),
		type: displayType(term, locale),
		href: termPath(term, locale),
		excerptHtml: renderSpotlightExcerpt(term, termsById, locale)
	};
}

function formatDate(iso: string, locale: string): string {
	return new Date(iso).toLocaleString(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function buildSections(terms: any[], locale: string) {
	const buckets = new Map<string, any[]>();

	for (const term of terms) {
		const name = displayName(term, locale);
		const letter = name[0].toUpperCase();
		if (!buckets.has(letter)) buckets.set(letter, []);
		buckets.get(letter)!.push({
			id: term.id,
			name,
			originalName: name !== term.name ? term.name : null,
			type: displayType(term, locale),
			href: termPath(term, locale)
		});
	}

	const letters = [...buckets.keys()].sort((a, b) => a.localeCompare(b, locale));
	return letters.map((letter) => ({
		letter,
		terms: buckets.get(letter)!.sort((a, b) => a.name.localeCompare(b.name, locale))
	}));
}

async function fetchChangelog(): Promise<ChangelogEntry[]> {
	const changelog = await fetchCollectionChangelog('https://glossary.data.heterarchy.fyi/changelog.json');
	return changelog.filter((entry) => entry.changes.length > 0);
}

export async function load() {
	const locale = getLocale();
	const [index, changelog] = await Promise.all([
		Promise.resolve(getGlossaryIndex()),
		fetchChangelog(),
	]);
	const contributors = getContributors();
	const ghByName = new Map(contributors.filter((c) => c.gh_username).map((c) => [c.name, c.gh_username]));
	const termsById = new Map(index.terms.map((term) => [term.id, term]));
	const glossaryTerms = (glossaryData as any).terms;

	return {
		sections: buildSections(index.terms, locale),
		spotlightFallback: randomFallbackSpotlight(glossaryTerms, termsById, locale),
		meta: index.meta,
		changelog: changelog.slice(0, 5).map((entry) => ({
			hash: entry.hash,
			shortHash: entry.hash.slice(0, 7),
			date: entry.date,
			dateLabel: formatDate(entry.date, locale),
			author: entry.author,
			authorGh: ghByName.get(entry.author) ?? null,
			commitHref: `${glossaryRepository}/commit/${entry.hash}`,
			changes: entry.changes.map((change) => {
				const term = termsById.get(change.id);
				return {
					...change,
					name: term ? displayName(term, locale) : change.id,
					href: term ? termPath(term, locale) : localizeUrl(`/glossary/${change.id}`),
					historyHref: `${localizeUrl(`/glossary/${change.id}/history`)}?commit=${entry.hash}`
				};
			})
		})),
		contributors,
		termCount: index.terms.length
	};
}
