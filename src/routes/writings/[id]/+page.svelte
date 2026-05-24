<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { getLocale, localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import glossaryData from '$lib/data/glossary.json';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const writing = $derived(data.writing);

	const paragraphs = $derived(
		data.content
			? data.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
			: []
	);
	const isMarkdown = $derived(Boolean(data.contentHtml));

	type GTerm = { id: string; name: string; translations?: Record<string, { slug?: string; name?: string }> };
	const allTerms = (glossaryData as { terms: GTerm[] }).terms;
	const glossaryByKey = new Map<string, GTerm>();
	for (const term of allTerms) {
		glossaryByKey.set(term.id, term);
		glossaryByKey.set(term.name.toLowerCase(), term);
		glossaryByKey.set(term.name.toLowerCase().replace(/\s+/g, '-'), term);
	}

	function wikilinkHref(term: GTerm): string {
		const slug = getLocale() === 'cs' ? (term.translations?.cs?.slug ?? term.id) : term.id;
		return localizeUrl(`/glossary/${slug}`);
	}

	function processWikilinks(text: string): string {
		return text.replace(/\[\[([^\|\]]+)(?:\|([^\]]+))?\]\]/g, (_, key, display) => {
			const label = display ?? key;
			const term = glossaryByKey.get(key.toLowerCase())
				?? glossaryByKey.get(key.toLowerCase().replace(/\s+/g, '-'))
				?? glossaryByKey.get(key);
			if (!term) return label;
			return `<a href="${wikilinkHref(term)}">${label}</a>`;
		});
	}

	function glossaryTermName(term: PageData['glossaryTerms'][number]): string {
		const cs = term.translations?.cs;
		return getLocale() === 'cs' && cs?.name ? cs.name : term.name;
	}

	function glossaryTermHref(term: PageData['glossaryTerms'][number]): string {
		const slug = getLocale() === 'cs' ? (term.translations?.cs?.slug ?? term.id) : term.id;
		return localizeUrl(`/glossary/${slug}`);
	}

	const descParagraphs = $derived(
		writing.description
			? writing.description.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
			: []
	);
	let descExpanded = $state(false);
	const hiddenWordCount = $derived(
		descParagraphs.slice(1).join(' ').replace(/\[\[([^\|\]]+)(?:\|[^\]]+)?\]\]/g, '$1').trim().split(/\s+/).filter(Boolean).length
	);

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{writing.title} — {m.writings_page_title()}</title>
	<meta name="description" content={writing.description?.replace(/\[\[([^\|\]]+)(?:\|[^\]]+)?\]\]/g, '$1').slice(0, 160) ?? ''} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<article>
			<!-- Header -->
			<header class="cell-roomy border-b border-line">
				<div class="mx-auto max-w-2xl">
				<a href={localizeUrl('/writings')} class="link-arrow mb-8 inline-block text-[12px]">{m.writings_detail_back()}</a>
					{#if writing.type}
						<p class="label mb-4">{writing.type}</p>
					{/if}
					<h1 class="page-lead mb-4 font-mono">{writing.title}</h1>
					<p class="font-mono text-[13px] text-black/55">
						{writing.authors.join(', ')}
						{#if writing.year}<span class="ml-3 text-black/35">·</span> <span class="ml-3">{writing.year}</span>{/if}
					</p>

					{#if descParagraphs.length > 0}
						<div class="mt-6 space-y-3 text-[15px] leading-[1.75] text-black/65 italic [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-black/30 [&_a:hover]:decoration-black/60">
							<p>
								{@html processWikilinks(descParagraphs[0])}{#if descParagraphs.length > 1 && !descExpanded}<button onclick={() => descExpanded = true} class="not-italic font-mono text-[11px] text-black/35 hover:text-black/60 ml-2 cursor-pointer">{m.writings_learn_more({ count: String(hiddenWordCount) })}</button>{/if}
							</p>
							{#if descExpanded}
								{#each descParagraphs.slice(1) as para}
									<p>{@html processWikilinks(para)}</p>
								{/each}
								<button onclick={() => descExpanded = false} class="not-italic font-mono text-[11px] text-black/35 hover:text-black/60 cursor-pointer">{m.writings_collapse()}</button>
							{/if}
						</div>
					{/if}

					{#if data.glossaryTerms.length > 0}
						<div class="mt-5 flex flex-wrap gap-2">
							{#each data.glossaryTerms as term}
								<a
									href={glossaryTermHref(term)}
									class="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-black/55 no-underline hover:border-black/40 hover:text-black"
								>{glossaryTermName(term)}</a>
							{/each}
						</div>
					{/if}
				</div>
			</header>

			<!-- Body -->
			{#if isMarkdown || paragraphs.length > 0}
				<section class="cell-roomy border-b border-line">
					<div class="prose mx-auto max-w-2xl">
						{#if isMarkdown}
							{@html data.contentHtml}
						{:else}
							{#each paragraphs as para}
								<p style="white-space: pre-wrap;">{para}</p>
							{/each}
						{/if}
					</div>
				</section>
			{/if}

			<!-- Footer metadata -->
			<footer class="cell-roomy">
				<div class="mx-auto max-w-2xl space-y-8">
					{#if writing.references.length > 0}
						<div>
							<p class="label mb-3">{m.writings_detail_references()}</p>
							<ul class="space-y-2">
								{#each writing.references as ref}
									<li class="flex items-baseline gap-3 font-mono text-[12px]">
										<span class="w-24 shrink-0 text-[10px] uppercase tracking-widest text-black/35">{ref.role}</span>
										<a href={ref.url} class="link-external break-all text-black/65" target="_blank" rel="noopener noreferrer">{ref.url}</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if writing.sources.length > 0}
						<div>
							<p class="label mb-3">{m.writings_detail_sources()}</p>
							<ul class="flex gap-4">
								{#each writing.sources as source}
									<li>
										<a
											href="https://writings.data.heterarchy.fyi/writings/{writing.id}/{source.path}"
											class="link-external font-mono text-[12px] text-black/65"
											target="_blank"
											rel="noopener noreferrer"
										>{source.format}</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if writing.license}
						<p class="font-mono text-[11px] text-black/35">{writing.license}</p>
					{/if}

					{#if writing.history?.length}
						<div>
							<p class="label mb-3">{m.writings_detail_history()}</p>
							<ul class="space-y-2">
								{#each writing.history as entry}
									<li class="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 font-mono text-[12px]">
										<a href="https://github.com/heterarchy-society/writings/commit/{entry.hash}" class="link-external tabular-nums text-black/45" target="_blank" rel="noopener noreferrer">{entry.hash.slice(0, 7)}</a>
										<span class="text-black/30">{formatDate(entry.date)}</span>
										<span class="text-black/55">{entry.author}</span>
										<span class="text-black/65">{entry.message}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</footer>
		</article>
	</main>

	<Footer />
</div>

<style>
	.prose :global(p) { font-size: 16px; line-height: 1.85; color: rgba(0,0,0,0.85); margin-bottom: 1.25rem; }
	.prose :global(h1), .prose :global(h2), .prose :global(h3) { font-family: inherit; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; }
	.prose :global(h1) { font-size: 1.4rem; }
	.prose :global(h2) { font-size: 1.15rem; }
	.prose :global(h3) { font-size: 1rem; }
	.prose :global(ul), .prose :global(ol) { padding-left: 1.5rem; margin-bottom: 1.25rem; font-size: 16px; line-height: 1.85; color: rgba(0,0,0,0.85); }
	.prose :global(li) { margin-bottom: 0.4rem; }
	.prose :global(blockquote) { border-left: 2px solid rgba(0,0,0,0.15); padding-left: 1rem; color: rgba(0,0,0,0.6); margin: 1.5rem 0; font-style: italic; }
	.prose :global(a) { text-decoration: underline; color: inherit; }
	.prose :global(code) { font-family: monospace; font-size: 0.875em; background: rgba(0,0,0,0.05); padding: 0.1em 0.3em; }
	.prose :global(hr) { border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 2rem 0; }
</style>
