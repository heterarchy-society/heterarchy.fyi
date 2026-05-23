<script lang="ts">
	import { MapPin, Search } from 'lucide-svelte';
	import { localizeUrl } from '$lib/i18n';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LibraryBookCard from '$lib/components/library/LibraryBookCard.svelte';
	import { libraryBooks, type LibraryBook } from '$lib/data/library';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let query = $state('');

	function matchesBook(book: LibraryBook, q: string): boolean {
		const needle = q.trim().toLowerCase();
		if (!needle) return true;
		const haystack = `${book.title} ${book.author} ${book.description}`.toLowerCase();
		return haystack.includes(needle);
	}

	const filteredBooks = $derived(libraryBooks.filter((book) => matchesBook(book, query)));
	const isSearching = $derived(query.trim().length > 0);
</script>

<svelte:head>
	<title>{m.books_page_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.books_page_lead()} />
</svelte:head>

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
				<div class="border-b border-line px-8 py-4 lg:px-10">
					<label class="sr-only" for="library-search">{m.books_search_label()}</label>
					<div class="relative max-w-md">
						<Search
							size={14}
							strokeWidth={1.25}
							class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-black/40"
							aria-hidden="true"
						/>
						<input
							id="library-search"
							type="search"
							bind:value={query}
							placeholder={m.books_search_placeholder()}
							class="w-full border-0 border-b border-line bg-transparent py-2 pr-8 pl-5 font-mono text-[13px] outline-none placeholder:text-black/40 focus:border-black"
						/>
						{#if isSearching}
							<button
								type="button"
								class="absolute top-1/2 right-0 -translate-y-1/2 font-mono text-[11px] text-black/45 hover:text-black"
								onclick={() => (query = '')}
							>
								{m.books_search_cancel()}
							</button>
						{/if}
					</div>
					{#if isSearching}
						<p class="mt-3 font-mono text-[11px] text-black/50">
							{m.books_search_showing({ count: String(filteredBooks.length), total: String(libraryBooks.length) })}
						</p>
					{/if}
				</div>

				{#if filteredBooks.length > 0}
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
						{#each filteredBooks as book (book.id)}
							<article class="border-r border-b border-line p-5 lg:p-6">
								<LibraryBookCard {book} large />
							</article>
						{/each}
					</div>
				{:else}
					<p class="px-8 py-12 font-mono text-[13px] text-black/55 lg:px-10">
						{m.books_no_results()}
					</p>
				{/if}
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
