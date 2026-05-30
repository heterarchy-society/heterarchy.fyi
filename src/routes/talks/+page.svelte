<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import TalkGrid from '$lib/components/talks/TalkGrid.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const PAGE_SIZE = 20;
	const totalCount = $derived(data.talks.length);
	let visibleCount = $state(PAGE_SIZE);
	let sentinel = $state<HTMLElement | null>(null);

	const visibleTalks = $derived(data.talks.slice(0, visibleCount));
	const hasMore = $derived(visibleCount < totalCount);

	$effect(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					visibleCount = Math.min(visibleCount + PAGE_SIZE, totalCount);
				}
			},
			{ rootMargin: '600px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>{m.talks_page_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.talks_page_lead()} />
</svelte:head>

<Seo title="{m.talks_page_label()} — The Heterarchy Society" description={m.talks_page_lead()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy border-b border-line">
			<div class="mb-4 flex items-start justify-between gap-4 lg:mb-0">
				<p class="label">{m.talks_page_label()}</p>
				{#if data.latestRevision}
					<LatestRevision latest={data.latestRevision} changelogHref={localizeUrl('/talks/changelog')} />
				{/if}
			</div>
			<h1 class="page-lead mb-4">{m.talks_page_title()}</h1>
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.talks_page_lead()}</p>
		</section>

		{#if data.talks.length > 0}
			<section>
				<TalkGrid talks={visibleTalks} borderTop={false} />
				{#if hasMore}
					<div bind:this={sentinel} class="h-1" aria-hidden="true"></div>
				{/if}
				<p class="px-8 py-6 font-mono text-[11px] text-black/35 lg:px-10">
					{m.talks_count({ count: String(data.talks.length) })}
				</p>
			</section>
		{/if}

		<section class="cell-roomy">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.talks_contribute_text()}</p>
			<div class="mt-6 flex flex-wrap gap-x-8 gap-y-3">
				<a href={localizeUrl('/find-us')} class="link-arrow text-[13px]">{m.talks_contribute_where()}</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
