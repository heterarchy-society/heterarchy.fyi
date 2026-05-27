<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CollectionChangelog from '$lib/components/CollectionChangelog.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { datasetConfigs } from '$lib/data/datasets';
	import type { PageData } from './$types';

	const talksRepository = datasetConfigs.find((d) => d.id === 'talks')!.repository;

	let { data }: { data: PageData } = $props();

	function talkName(id: string): string {
		return data.talks.find((t) => t.id === id)?.title ?? id;
	}

	function talkHref(id: string): string {
		return localizeUrl(`/talks/${id}`);
	}
</script>

<svelte:head>
	<title>{m.talks_changelog_page_title()} — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={localizeUrl('/talks')} class="link-arrow mb-8 inline-block text-[12px]">{m.collection_changelog_back_to({ collection: m.talks_page_label() })}</a>
			<p class="label mb-4">{m.talks_page_label()}</p>
			<h1 class="page-lead mb-10">{m.collection_changelog_title()}</h1>

			<CollectionChangelog
				entries={data.changelog}
				repository={talksRepository}
				itemName={talkName}
				itemHref={talkHref}
			/>
		</section>
	</main>

	<Footer />
</div>
