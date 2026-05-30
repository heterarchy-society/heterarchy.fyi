<script lang="ts">
	import { MapPin } from 'lucide-svelte';
	import { localizeUrl } from '$lib/i18n';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import LibraryBookCard from '$lib/components/library/LibraryBookCard.svelte';
	import { libraryBooks } from '$lib/data/library';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const PAGE_SIZE = 24;
	const totalCount = libraryBooks.length;
	let visibleCount = $state(PAGE_SIZE);
	let sentinel = $state<HTMLElement | null>(null);

	const visibleBooks = $derived(libraryBooks.slice(0, visibleCount));
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
	<title>{m.books_page_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.books_page_lead()} />
</svelte:head>

<Seo title="{m.books_page_label()} — The Heterarchy Society" description={m.books_page_lead()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<div class="mb-4 flex items-start justify-between gap-4 lg:mb-0">
				<p class="label">{m.books_page_label()}</p>
				{#if data.changelog[0]}
					<LatestRevision latest={data.changelog[0]} changelogHref={localizeUrl('/books/changelog')} />
				{/if}
			</div>

			<h1 class="page-lead mb-4">{m.books_page_title()}</h1>

			<p class="mb-8 max-w-xl text-[15px] leading-[1.65] text-black/75">{m.books_page_lead()}</p>

			<div class="flex items-start gap-2.5 font-mono text-[12px]">
				<MapPin size={14} strokeWidth={1.25} class="mt-0.5 shrink-0" />
				<div>
					<p class="font-semibold">Bordel, Praha</p>
					<p class="mt-1 text-black/60">{m.books_page_location_note()}</p>
				</div>
			</div>
		</section>

		{#if libraryBooks.length > 0}
			<section class="border-b border-line">
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
					{#each visibleBooks as book (book.id)}
						<article class="border-r border-b border-line p-5 lg:p-6">
							<LibraryBookCard {book} large />
						</article>
					{/each}
				</div>
				{#if hasMore}
					<div bind:this={sentinel} class="h-1" aria-hidden="true"></div>
				{/if}
				<p class="px-8 py-6 font-mono text-[11px] text-black/35 lg:px-10">
					{m.books_count({ count: String(totalCount) })}
				</p>
			</section>
		{/if}

		<section class="cell-roomy" id="darovat">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.books_contribute_text()}</p>
			<div class="mt-6 flex flex-wrap gap-x-8 gap-y-3">
				<a href={localizeUrl('/find-us')} class="link-arrow text-[13px]">{m.books_contribute_where()}</a>
				<a href={localizeUrl('/join')} class="link-arrow text-[13px]">{m.books_contribute_join()}</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
