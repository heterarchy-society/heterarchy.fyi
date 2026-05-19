<script lang="ts">
	import { MapPin, Search } from 'lucide-svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LibraryBookCard from '$lib/components/library/LibraryBookCard.svelte';
	import {
		libraryBooks,
		libraryContribute,
		libraryIntro,
		libraryLocation,
		libraryMeta,
		libraryName,
		type LibraryBook
	} from '$lib/data/library';

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
	<title>{libraryMeta.title}</title>
	<meta name="description" content={libraryMeta.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">{libraryIntro.label}</p>

			<h1 class="page-lead mb-4 max-w-2xl whitespace-normal">{libraryName}</h1>

			<p class="mb-8 max-w-xl text-[15px] leading-[1.65] text-black/75">{libraryIntro.lead}</p>

			<div class="flex items-start gap-2.5 font-mono text-[12px]">
				<MapPin size={14} strokeWidth={1.25} class="mt-0.5 shrink-0" />
				<div>
					<p class="font-semibold">{libraryLocation.name}, {libraryLocation.city}</p>
					<p class="mt-1 text-black/60">{libraryLocation.note}</p>
				</div>
			</div>
		</section>

		{#if libraryBooks.length > 0}
			<section class="border-b border-line">
				<div class="border-b border-line px-8 py-4 lg:px-10">
					<label class="sr-only" for="library-search">Hledat v knihovně</label>
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
							placeholder="Hledat knihu, autora…"
							class="w-full border-0 border-b border-line bg-transparent py-2 pr-8 pl-5 font-mono text-[13px] outline-none placeholder:text-black/40 focus:border-black"
						/>
						{#if isSearching}
							<button
								type="button"
								class="absolute top-1/2 right-0 -translate-y-1/2 font-mono text-[11px] text-black/45 hover:text-black"
								onclick={() => (query = '')}
							>
								zrušit
							</button>
						{/if}
					</div>
					{#if isSearching}
						<p class="mt-3 font-mono text-[11px] text-black/50">
							Zobrazeno {filteredBooks.length} z {libraryBooks.length}
						</p>
					{/if}
				</div>

				{#if filteredBooks.length > 0}
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{#each filteredBooks as book (book.id)}
							<article class="border-r border-b border-line p-5 lg:p-6">
								<LibraryBookCard {book} large />
							</article>
						{/each}
					</div>
				{:else}
					<p class="px-8 py-12 font-mono text-[13px] text-black/55 lg:px-10">
						Nic nenalezeno. Zkus jiný výraz.
					</p>
				{/if}
			</section>
		{/if}

		<section class="cell-roomy" id="darovat">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{libraryContribute.text}</p>
			<div class="mt-6 flex flex-wrap gap-x-8 gap-y-3">
				{#each libraryContribute.links as link}
					<a href={link.href} class="link-arrow text-[13px]">{link.label}</a>
				{/each}
			</div>
		</section>
	</main>

	<Footer />
</div>
