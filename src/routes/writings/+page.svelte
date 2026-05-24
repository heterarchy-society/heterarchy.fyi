<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
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
					<a href={localizeUrl(`/writings/${writing.id}`)} class="block border-b border-line px-8 py-8 no-underline hover:bg-bg-muted lg:px-10">
						<div class="max-w-2xl">
							<p class="mb-2 font-mono text-[11px] uppercase tracking-widest text-black/35">
								{writing.authors.join(', ')}{#if writing.year} · {writing.year}{/if}
							</p>
							<h2 class="mb-3 font-mono text-[20px] leading-snug text-black">{writing.title}</h2>
							{#if writing.description}
								<p class="text-[14px] leading-[1.65] text-black/60 line-clamp-2">
									{writing.description.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')}
								</p>
							{/if}
						</div>
					</a>
				{/each}
			</section>
		{/if}

		<section class="cell-roomy">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.writings_contribute_text()}</p>
			<div class="mt-6">
				<a href={localizeUrl('/find-us')} class="link-arrow text-[13px]">{m.writings_contribute_where()}</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
