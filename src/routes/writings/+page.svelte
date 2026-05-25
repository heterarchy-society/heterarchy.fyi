<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import { Headphones } from 'lucide-svelte';
	import { writingAuthorText } from '$lib/data/writings';

	let { data }: { data: PageData } = $props();

	function wordCount(writing: PageData['writings'][number]): number | null {
		if (!writing._assets) return null;
		for (const s of writing.sources) {
			if (['md', 'txt'].includes(s.format) && !s.generated_from) {
				const w = writing._assets[s.path]?.text?.words;
				if (w) return w;
			}
		}
		return null;
	}

	function fmtWords(n: number): string {
		return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
	}
</script>

<svelte:head>
	<title>{m.writings_page_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.writings_page_lead()} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy border-b border-line">
			<div class="mb-4 flex items-start justify-between gap-4 lg:mb-0">
				<p class="label">{m.writings_page_label()}</p>
				{#if data.changelog?.[0]}
					<LatestRevision latest={data.changelog[0]} changelogHref={localizeUrl('/writings/changelog')} />
				{/if}
			</div>
			<h1 class="page-lead mb-4">{m.writings_page_title()}</h1>
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.writings_page_lead()}</p>
		</section>

		{#if data.writings.length > 0}
			<section>
				{#each data.writings as writing (writing.id)}
					<a href={localizeUrl(`/writings/${writing.id}`)} class="group block border-b border-line px-8 py-8 no-underline lg:px-10">
						<div class="max-w-2xl">
							<p class="mb-2 flex items-center gap-0 font-mono text-[11px] uppercase tracking-widest text-black/35">
								<span>{writingAuthorText(writing.authors)}{#if writing.year} · {writing.year}{/if}{#if wordCount(writing) !== null} · {fmtWords(wordCount(writing)!)}W{/if}</span>
								{#if writing.audio?.length}
									<span class="ml-[0.45em] flex items-center gap-1"> · <Headphones size={11} strokeWidth={1.8} class="ml-[0.45em]" />{#if writing.audio[0].duration}<span class="ml-1">{writing.audio[0].duration}</span>{/if}</span>
								{/if}
							</p>
							<h2 class="mb-3 font-mono text-[20px] leading-snug text-black underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">{writing.title}</h2>
							{#if writing.description}
								<p class="text-[14px] leading-[1.65] text-black/60">
									{writing.description.split(/\n\n+/)[0].replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')}
								</p>
							{/if}
						</div>
					</a>
				{/each}
				<p class="px-8 py-6 font-mono text-[11px] text-black/35 lg:px-10">{m.writings_count({ count: String(data.writings.length) })}</p>
			</section>
		{/if}

	</main>

	<Footer />
</div>
