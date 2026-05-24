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
	const selectedFormat = $derived(data.selectedSource?.format);
	const isPlainText = $derived(selectedFormat === 'txt');
	const isSourceText = $derived(selectedFormat === 'typst' || selectedFormat === 'typ');
	const isPdf = $derived(selectedFormat === 'pdf');

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

	function formatLabel(source: { format: string; variant?: string }): string {
		const formatMap: Record<string, string> = {
			md: m.writings_format_md(),
			txt: m.writings_format_txt(),
			pdf: m.writings_format_pdf(),
			html: m.writings_format_html(),
			typst: 'typst',
			typ: 'typst',
		};
		const label = formatMap[source.format] ?? source.format;
		return source.variant ? `${label} ${source.variant}` : label;
	}

	function formatHref(source: PageData['readableSources'][number]): string {
		return `${localizeUrl(`/writings/${writing.id}`)}?format=${encodeURIComponent(source.key)}`;
	}

	function formatSize(bytes: number | null | undefined): string {
		if (!bytes) return '—';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function sourceClass(source: PageData['readableSources'][number]): string {
		const active = data.selectedSource?.key === source.key;
		return [
			'relative px-1 pb-5 pt-1 no-underline transition-colors',
			'font-mono text-[10px] uppercase tracking-widest',
			active ? 'text-black after:absolute after:left-1/2 after:top-6 after:-translate-x-1/2 after:text-[11px] after:text-black after:content-["↓"]' : 'text-black/40 hover:text-black',
		].join(' ');
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
						{#if writing.language}<span class="ml-3 text-black/35">·</span> <span class="ml-3">{new Intl.DisplayNames([getLocale()], { type: 'language' }).of(writing.language) ?? writing.language}</span>{/if}
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

					{#if data.readableSources.length > 1}
						<nav class="-mb-10 mt-10 flex max-w-full flex-wrap items-end justify-center gap-x-4 gap-y-1 pt-1" aria-label="Writing formats">
							{#each data.readableSources as source}
								<a
									href={formatHref(source)}
									class={sourceClass(source)}
									aria-current={data.selectedSource?.key === source.key ? 'true' : undefined}
								>{formatLabel(source)}</a>
							{/each}
						</nav>
					{/if}
				</div>
			</header>

			<!-- Body -->
			{#if isMarkdown || paragraphs.length > 0 || isPdf || isSourceText}
				<section class={isPdf ? 'cell-roomy border-b border-line' : 'writing-paper border-b border-line px-8 py-10 lg:px-10 lg:py-12'}>
					{#if isPdf && data.selectedSource}
						<div class="mx-auto max-w-4xl">
							<iframe
								src={data.selectedSource.url}
								title={writing.title}
								class="h-[78vh] min-h-[520px] w-full border border-line bg-white"
							></iframe>
							<div class="mt-3 text-right">
								<a
									href={data.selectedSource.url}
									class="link-external font-mono text-[11px] text-black/45"
									target="_blank"
									rel="noopener noreferrer"
								>{m.writings_open_pdf()}</a>
							</div>
						</div>
					{:else if isSourceText}
						<pre class="mx-auto max-w-2xl overflow-x-auto border-l border-line pl-5 font-mono text-[12px] leading-[1.75] text-black/70"><code>{data.content}</code></pre>
					{:else}
						<div class="prose mx-auto max-w-2xl">
							{#if isMarkdown}
								{@html data.contentHtml}
							{:else if isPlainText}
								{#each paragraphs as para}
									<p style="white-space: pre-wrap;">{para}</p>
								{/each}
							{/if}
						</div>
					{/if}
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

					{#if data.downloadSources.length > 0}
						<div>
							<p class="label mb-3">{m.writings_detail_sources()}</p>
							<table class="w-full font-mono text-[12px]">
								<tbody>
									{#each data.downloadSources as source}
										<tr class="border-t border-line cursor-pointer hover:bg-bg-muted" onclick={() => window.open(source.url, '_blank')}>
											<td class="py-3 pr-6 text-black/70">{formatLabel(source)}</td>
											<td class="py-3 pr-6 text-[10px] uppercase tracking-widest text-black/30">{source.generated_from ? m.writings_source_generated() : m.writings_source_canonical()}</td>
											<td class="py-3 pr-6 tabular-nums text-black/30">{formatSize(source.size)}</td>
											<td class="py-3 text-right">
												<div class="flex items-center justify-end gap-4">
													<a
														href={source.url}
														class="text-black/45 no-underline hover:text-black"
														target="_blank"
														rel="noopener noreferrer"
													>{m.writings_source_open()}</a>
													<a
														href={source.url}
														class="text-black/45 no-underline hover:text-black"
														target="_blank"
														rel="noopener noreferrer"
														download
													>{m.writings_source_download()}</a>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
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
	.writing-paper {
		background: #f8f7f3;
	}

	.prose {
		font-family: Iowan Old Style, Palatino Linotype, Palatino, Charter, Georgia, ui-serif, serif;
		font-variant-ligatures: common-ligatures;
	}

	.prose :global(p) {
		margin-bottom: 1.35rem;
		color: rgba(0,0,0,0.78);
		font-size: 18px;
		line-height: 1.78;
	}

	.prose :global(h1),
	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4) {
		margin-top: 3rem;
		margin-bottom: 0.85rem;
		color: rgba(0,0,0,0.86);
		font-family: var(--font-sans);
		font-weight: 500;
		line-height: 1.35;
	}

	.prose :global(h1) {
		margin-top: 0;
		margin-bottom: 1.6rem;
		font-size: 1.25rem;
	}

	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4) {
		border-top: 1px solid rgba(0,0,0,0.1);
		padding-top: 1.55rem;
	}

	.prose :global(h2) {
		font-size: 1.32rem;
	}

	.prose :global(h3) {
		font-size: 1.12rem;
		font-weight: 550;
	}

	.prose :global(h4) {
		margin-top: 2.25rem;
		margin-bottom: 0.65rem;
		border-top: 0;
		padding-top: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.prose :global(ul),
	.prose :global(ol) {
		margin-bottom: 1.35rem;
		padding-left: 1.5rem;
		color: rgba(0,0,0,0.78);
		font-size: 18px;
		line-height: 1.78;
	}

	.prose :global(li) { margin-bottom: 0.45rem; }

	.prose :global(blockquote) {
		margin: 1.75rem 0;
		border-left: 2px solid rgba(0,0,0,0.14);
		padding-left: 1.15rem;
		color: rgba(0,0,0,0.58);
		font-style: italic;
	}

	.prose :global(a) {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: rgba(0,0,0,0.28);
		text-underline-offset: 0.16em;
	}

	.prose :global(a:hover) {
		text-decoration-color: rgba(0,0,0,0.55);
	}

	.prose :global(.footnote-ref) {
		margin-left: 0.08em;
		font-family: var(--font-sans);
		font-size: 0.68em;
		line-height: 0;
	}

	.prose :global(.footnote-ref a) {
		text-decoration: none;
	}

	.prose :global(.footnotes) {
		margin-top: 2.75rem;
		border-top: 1px solid rgba(0,0,0,0.12);
		padding-top: 1rem;
		font-family: var(--font-sans);
		font-size: 13px;
		line-height: 1.65;
		color: rgba(0,0,0,0.55);
	}

	.prose :global(.footnotes ol) {
		margin: 0;
		padding-left: 0;
		font-size: inherit;
		line-height: inherit;
		list-style: none;
		color: inherit;
	}

	.prose :global(.footnotes li) {
		display: flex;
		gap: 0.55rem;
		margin-bottom: 0.45rem;
	}

	.prose :global(.footnote-number) {
		flex: none;
		min-width: 1.4rem;
		color: rgba(0,0,0,0.4);
		font-variant-numeric: tabular-nums;
	}

	.prose :global(.footnote-backref) {
		flex: none;
		text-decoration: none;
		color: rgba(0,0,0,0.35);
	}

	.prose :global(code) {
		background: rgba(0,0,0,0.045);
		padding: 0.1em 0.3em;
		font-family: var(--font-mono);
		font-size: 0.82em;
	}

	.prose :global(hr) {
		margin: 2rem 0;
		border: none;
		border-top: 1px solid rgba(0,0,0,0.1);
	}
</style>
