<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import WritingItem from '$lib/components/writings/WritingItem.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m.writings_page_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.writings_page_lead()} />
</svelte:head>

<Seo title="{m.writings_page_label()} — The Heterarchy Society" description={m.writings_page_lead()} />

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
					<WritingItem {writing} variant="full" class="border-b border-line px-8 py-8 lg:px-10" />
				{/each}
				<p class="px-8 py-6 font-mono text-[11px] text-black/35 lg:px-10">{m.writings_count({ count: String(data.writings.length) })}</p>
			</section>
		{/if}

	</main>

	<Footer />
</div>
