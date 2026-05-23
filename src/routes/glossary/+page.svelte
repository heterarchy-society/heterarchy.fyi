<script lang="ts">
	import { onMount } from 'svelte';
	import { RotateCcw } from 'lucide-svelte';
	import Header from '$lib/components/Header.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { localizeUrl, getLocale } from '$lib/i18n';
	import { timeAgo } from '$lib/time';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import type { ChangelogEntry } from './+page.server';

	let { data }: { data: PageData } = $props();

	let spotlight = $state<(typeof data.terms)[0] | null>(null);

	function pickSpotlight() {
		const next = data.terms[Math.floor(Math.random() * data.terms.length)];
		spotlight = next.id !== spotlight?.id ? next : data.terms[(data.terms.indexOf(next) + 1) % data.terms.length];
	}

	onMount(pickSpotlight);

	const ghByName = $derived(
		new Map(data.contributors.filter(c => c.gh_username).map(c => [c.name, c.gh_username!]))
	);

	function displayName(term: any): string {
		if (getLocale() === 'cs') {
			return term.translations?.cs?.name ?? term.name;
		}
		return term.name;
	}

	function displayType(term: any): string | null {
		if (getLocale() === 'cs') {
			return term.translations?.cs?.type ?? term.type ?? null;
		}
		return term.type ?? null;
	}

	function termHref(term: any): string {
		const id = getLocale() === 'cs'
			? (term.translations?.cs?.slug ?? term.id)
			: term.id;
		return localizeUrl(`/glossary/${id}`);
	}

	function termHrefById(id: string): string {
		const term = data.terms.find((t: any) => t.id === id);
		return termHref(term ?? { id, translations: {} });
	}

	function termNameById(id: string): string {
		const term = data.terms.find((t: any) => t.id === id);
		if (!term) return id;
		return displayName(term);
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function hasStats(stats: { added: number; removed: number } | undefined): stats is { added: number; removed: number } {
		return Boolean(stats && (stats.added > 0 || stats.removed > 0));
	}

	function renderExcerpt(term: any, text: string): string {
		const resolved = new Map<string, string>();
		for (const rl of (term.resolvedLinks ?? []) as { key: string; link: string | null; target: string | null }[]) {
			if (rl.target) {
				resolved.set((rl.link ?? rl.key).toLowerCase(), rl.target);
				resolved.set(rl.key.toLowerCase(), rl.target);
			}
		}
		return text
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/g, (_, display, explicit) => {
				const target = resolved.get((explicit ?? display).toLowerCase());
				if (!target) return display;
				return `<a href="${termHrefById(target)}" class="underline decoration-black/20 hover:decoration-black/60">${display}</a>`;
			});
	}


	const letters = $derived(() => {
		const locale = getLocale() === 'cs' ? 'cs' : 'en';
		const set = new Set<string>();
		for (const term of data.terms) set.add(displayName(term)[0].toUpperCase());
		return [...set].sort((a, b) => a.localeCompare(b, locale));
	});

	const byLetter = $derived(() => {
		const locale = getLocale() === 'cs' ? 'cs' : 'en';
		const map = new Map<string, typeof data.terms>();
		for (const term of data.terms) {
			const l = displayName(term)[0].toUpperCase();
			if (!map.has(l)) map.set(l, []);
			map.get(l)!.push(term);
		}
		for (const [, bucket] of map) {
			bucket.sort((a, b) => displayName(a).localeCompare(displayName(b), locale));
		}
		return map;
	});
</script>

<svelte:head>
	<title>{m.glossary_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.glossary_lead()} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<div class="mb-4 flex items-start justify-between gap-4 lg:mb-0">
				<p class="label">{m.glossary_label()}</p>
				{#if data.changelog[0]}
					<LatestRevision latest={data.changelog[0]} changelogHref={localizeUrl('/glossary/changelog')} />
				{/if}
			</div>
			<p class="page-lead mb-10">{m.glossary_lead()}</p>

			<div class="grid gap-16 lg:grid-cols-[1fr_480px]">
				<!-- Left: term index -->
				<div class="min-w-0">
					<nav class="mb-10 flex flex-wrap gap-2 font-mono text-[12px]">
						{#each letters() as letter}
							<a href="#{letter}" class="border border-line px-2 py-1 no-underline text-black/60 hover:border-black/40 hover:text-black">
								{letter}
							</a>
						{/each}
					</nav>

					<div>
						{#each letters() as letter}
							<div id={letter} class="border-t border-line pt-8 pb-6">
								<p class="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-black/30">{letter}</p>
								<ul class="flex flex-col divide-y divide-line">
									{#each byLetter().get(letter) ?? [] as term}
										{@const csTranslated = getLocale() === 'cs' && term.translations?.cs?.name}
										{@const type = displayType(term)}
										<li>
											<a href={termHref(term)} class="group flex items-baseline gap-3 py-3 no-underline">
												<span class="font-mono text-[14px] leading-snug">
													<span class="group-hover:underline">{displayName(term)}</span>
													{#if csTranslated && term.translations?.cs?.name !== term.name}
														<span class="text-black/35 no-underline"> ({term.name})</span>
													{/if}
												</span>
												{#if type}
													<span class="font-mono text-[10px] uppercase tracking-wider text-black/35 whitespace-nowrap">{type}</span>
												{/if}
												<span class="ml-auto font-mono text-[12px] text-black/30 group-hover:text-black">→</span>
											</a>
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>

					<p class="mt-8 font-mono text-[11px] text-black/35">{m.glossary_term_count({ count: String(data.terms.length) })}</p>
				</div>

				<!-- Right: spotlight + changelog -->
				<aside class="border-t border-line pt-8 lg:border-t-0 lg:border-l lg:border-line lg:pl-8 lg:pt-0">
					{#if spotlight}
						{@const spotlightExcerpt = getLocale() === 'cs'
							? ((spotlight.translations?.cs as any)?.excerpt ?? spotlight.excerpt)
							: spotlight.excerpt}
						<div class="relative mb-10">
							<button
								onclick={pickSpotlight}
								class="absolute top-0 right-0 cursor-pointer text-black/20 hover:text-black transition-colors"
								aria-label="Next random term"
							>
								<RotateCcw size={16} strokeWidth={1.5} />
							</button>
							{#if spotlight.type}
								<p class="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/30">{displayType(spotlight)}</p>
							{/if}
							<h2 class="mb-3 font-mono text-[1.1rem] leading-snug">
								<a href={termHref(spotlight)} class="hover:underline">{displayName(spotlight)}</a>
							</h2>
							<p class="text-[13px] leading-[1.7] text-black/60">{@html renderExcerpt(spotlight, spotlightExcerpt)}</p>
							<a href={termHref(spotlight)} class="mt-3 block font-mono text-[11px] text-black/35 no-underline hover:text-black hover:underline">{m.spotlight_read_more()}</a>
						</div>
					{:else}
						<div class="mb-10 animate-pulse">
							<div class="mb-2 h-2 w-20 rounded bg-black/8"></div>
							<div class="mb-3 h-5 w-48 rounded bg-black/8"></div>
							<div class="space-y-2">
								<div class="h-3 w-full rounded bg-black/6"></div>
								<div class="h-3 w-full rounded bg-black/6"></div>
								<div class="h-3 w-4/5 rounded bg-black/6"></div>
							</div>
						</div>
					{/if}

					{#if data.changelog.length > 0}
						<div class="border-t border-line pt-6 mb-2 flex items-baseline justify-between gap-4">
							<p class="label">{m.glossary_changelog_label()}</p>
							<a href={localizeUrl('/glossary/changelog')} class="font-mono text-[11px] text-black/35 no-underline hover:text-black hover:underline">
								{m.collection_changelog_all()}
							</a>
						</div>
						<ul class="flex flex-col font-mono text-[11px] divide-y divide-line">
							{#each data.changelog as entry (entry.hash)}
								{@const gh = ghByName.get(entry.author)}
								<li class="py-4 first:pt-2">
									<div class="mb-2 flex items-center gap-2 text-black/35">
										<span>{formatDate(entry.date)}</span>
										<span class="text-black/20">·</span>
										{#if gh}
											<a href="https://github.com/{gh}" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-1.5 no-underline hover:text-black">
												<img src="https://github.com/{gh}.png?size=40" alt={gh} width={16} height={16} class="rounded-full border border-line opacity-75 transition-opacity group-hover:opacity-100" />
												<span>{gh}</span>
											</a>
										{:else}
											<span>{entry.author}</span>
										{/if}
										<span class="text-black/20">·</span>
										<a
											href="https://github.com/heterarchy-society/glossary/commit/{entry.hash}"
											target="_blank"
											rel="noopener noreferrer"
											class="no-underline hover:text-black hover:underline font-mono"
										>{entry.hash.slice(0, 7)}</a>
									</div>
									<ul class="flex flex-col gap-1">
										{#each entry.changes as change}
											<li class="flex items-baseline gap-2">
												<span class="shrink-0 text-[10px] uppercase tracking-wider {change.op === 'added' ? 'text-black/40' : 'text-black/30'}">
													{change.op === 'added' ? m.glossary_changelog_op_added() : m.glossary_changelog_op_modified()}
												</span>
												<a href={termHrefById(change.id)} class="no-underline hover:underline leading-snug text-black/70">
													{termNameById(change.id)}
												</a>
												{#if hasStats(change.stats)}
													<span class="shrink-0 text-[10px] tabular-nums">
														{#if change.stats.added > 0}
															<span class="text-green-700">+{change.stats.added}</span>
														{/if}
														{#if change.stats.removed > 0}
															<span class:ml-1={change.stats.added > 0} class="text-red-700">-{change.stats.removed}</span>
														{/if}
													</span>
												{/if}
												<a href={localizeUrl(`/glossary/${change.id}/history`) + `?commit=${entry.hash}`} class="text-black/30 no-underline hover:underline hover:text-black shrink-0">(diff)</a>
											</li>
										{/each}
									</ul>
								</li>
							{/each}
						</ul>
						{#if data.contributors.length > 0}
							<div class="mt-10 border-t border-line pt-8">
								<p class="label mb-4">{m.glossary_contributors_label()}</p>
								<ul class="flex flex-col gap-2 font-mono text-[11px]">
									{#each data.contributors as contributor}
										<li class="flex items-center justify-between gap-3">
											<div class="flex items-center gap-2">
												{#if contributor.gh_username}
													<img src="https://github.com/{contributor.gh_username}.png?size=40" alt={contributor.gh_username} width={20} height={20} class="rounded-full border border-line shrink-0" />
													<a href="https://github.com/{contributor.gh_username}" target="_blank" rel="noopener noreferrer" class="text-black/70 no-underline hover:underline">{contributor.gh_username}</a>
												{:else}
													<span class="w-5 h-5 rounded-full border border-line bg-bg-muted shrink-0"></span>
													<span class="text-black/70">{contributor.name}</span>
												{/if}
											</div>
											<span class="text-black/30">{contributor.commits}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					{/if}
				</aside>
			</div>
		</section>
	</main>

	<Footer />
</div>
