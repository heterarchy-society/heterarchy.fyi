<script lang="ts">
	import { onMount } from 'svelte';
	import { RotateCcw } from 'lucide-svelte';
	import Header from '$lib/components/Header.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let spotlight = $state<(typeof data.spotlightTerms)[0] | null>(null);
	let expandedChanges = $state(new Set<string>());

	function pickSpotlight() {
		const pool = data.spotlightTerms.filter((t) => t.excerptHtml);
		if (!pool.length) return;
		const next = pool[Math.floor(Math.random() * pool.length)];
		spotlight = next.id !== spotlight?.id ? next : pool[(pool.indexOf(next) + 1) % pool.length];
	}

	onMount(pickSpotlight);

	function hasStats(stats: { added: number; removed: number } | undefined): stats is { added: number; removed: number } {
		return Boolean(stats && (stats.added > 0 || stats.removed > 0));
	}

	function expandChanges(hash: string) {
		expandedChanges = new Set(expandedChanges).add(hash);
	}
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
						{#each data.sections as section}
							<a href="#{section.letter}" class="border border-line px-2 py-1 no-underline text-black/60 hover:border-black/40 hover:text-black">
								{section.letter}
							</a>
						{/each}
					</nav>

					<div>
						{#each data.sections as section}
							<div id={section.letter} class="border-t border-line pt-8 pb-6">
								<p class="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-black/30">{section.letter}</p>
								<ul class="flex flex-col divide-y divide-line">
									{#each section.terms as term}
										<li>
											<a href={term.href} class="group flex items-baseline gap-3 py-3 no-underline">
												<span class="font-mono text-[14px] leading-snug">
													<span class="group-hover:underline">{term.name}</span>
													{#if term.originalName}
														<span class="text-black/35 no-underline"> ({term.originalName})</span>
													{/if}
												</span>
												{#if term.type}
													<span class="font-mono text-[10px] uppercase tracking-wider text-black/35 whitespace-nowrap">{term.type}</span>
												{/if}
												<span class="ml-auto font-mono text-[12px] text-black/30 group-hover:text-black">→</span>
											</a>
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>

					<p class="mt-8 font-mono text-[11px] text-black/35">{m.glossary_term_count({ count: String(data.termCount) })}</p>
				</div>

				<!-- Right: spotlight + changelog -->
				<aside class="border-t border-line pt-8 lg:border-t-0 lg:border-l lg:border-line lg:pl-8 lg:pt-0">
					{#if spotlight}
						<div class="relative mb-10">
							<button
								onclick={pickSpotlight}
								class="absolute top-0 right-0 cursor-pointer text-black/20 hover:text-black transition-colors"
								aria-label="Next random term"
							>
								<RotateCcw size={16} strokeWidth={1.5} />
							</button>
							{#if spotlight.type}
								<p class="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/30">{spotlight.type}</p>
							{/if}
							<h2 class="mb-3 font-mono text-[1.1rem] leading-snug">
								<a href={spotlight.href} class="hover:underline">{spotlight.name}</a>
							</h2>
							<p class="text-[13px] leading-[1.7] text-black/60">{@html spotlight.excerptHtml}</p>
							<a href={spotlight.href} class="mt-3 block font-mono text-[11px] text-black/35 no-underline hover:text-black hover:underline">{m.spotlight_read_more()}</a>
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
								{m.glossary_recent_show_all()}
							</a>
						</div>
						<ul class="flex flex-col font-mono text-[11px] divide-y divide-line">
							{#each data.changelog as entry (entry.hash)}
								{@const expanded = expandedChanges.has(entry.hash)}
								{@const visibleChanges = expanded ? entry.changes : entry.changes.slice(0, 5)}
								{@const hiddenCount = entry.changes.length - visibleChanges.length}
								<li class="py-4 first:pt-2">
									<div class="mb-2 flex items-center gap-2 text-black/35">
										<span>{entry.dateLabel}</span>
										<span class="text-black/20">·</span>
										{#if entry.authorGh}
											<a href="https://github.com/{entry.authorGh}" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-1.5 no-underline hover:text-black">
												<img src="https://github.com/{entry.authorGh}.png?size=40" alt={entry.authorGh} width={16} height={16} class="rounded-full border border-line opacity-75 transition-opacity group-hover:opacity-100" />
												<span>{entry.authorGh}</span>
											</a>
										{:else}
											<span>{entry.author}</span>
										{/if}
										<span class="text-black/20">·</span>
										<a
											href={entry.commitHref}
											target="_blank"
											rel="noopener noreferrer"
											class="no-underline hover:text-black hover:underline font-mono"
										>{entry.shortHash}</a>
									</div>
									<ul class="flex flex-col gap-1">
										{#each visibleChanges as change}
											<li class="flex items-baseline gap-2">
												<span class="shrink-0 text-[10px] uppercase tracking-wider {change.op === 'added' ? 'text-black/40' : 'text-black/30'}">
													{change.op === 'added' ? m.glossary_changelog_op_added() : m.glossary_changelog_op_modified()}
												</span>
												<a href={change.href} class="no-underline hover:underline leading-snug text-black/70">
													{change.name}
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
												<a href={change.historyHref} class="text-black/30 no-underline hover:underline hover:text-black shrink-0">(diff)</a>
											</li>
										{/each}
										{#if hiddenCount > 0}
											<li>
												<button
													type="button"
													class="cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] text-black/35 hover:text-black hover:underline"
													aria-expanded={expanded}
													onclick={() => expandChanges(entry.hash)}
												>
													{m.glossary_recent_more_changes({ count: String(hiddenCount) })}
												</button>
											</li>
										{/if}
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
