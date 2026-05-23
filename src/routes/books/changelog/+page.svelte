<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CollectionChangelog from '$lib/components/CollectionChangelog.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function bookForId(id: string) {
		return data.books.find((book) => book.id === id);
	}

	function bookName(id: string): string {
		return bookForId(id)?.title ?? id;
	}

	function bookHref(id: string): string {
		return localizeUrl(`/books/${id}`);
	}
</script>

<svelte:head>
	<title>{m.books_changelog_page_title()} — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={localizeUrl('/books')} class="link-arrow mb-8 inline-block text-[12px]">{m.collection_changelog_back_to({ collection: m.books_page_label() })}</a>
			<p class="label mb-4">{m.books_page_label()}</p>
			<h1 class="page-lead mb-10">{m.collection_changelog_title()}</h1>

			<CollectionChangelog
				entries={data.changelog}
				repository="heterarchy-society/books"
				itemName={bookName}
				itemHref={bookHref}
			/>
		</section>
	</main>

	<Footer />
</div>
