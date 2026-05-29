<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CollectionChangelog from '$lib/components/CollectionChangelog.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { datasetConfigs } from '$lib/data/datasets';
	import type { PageData } from './$types';

	const eventsRepository = datasetConfigs.find((d) => d.id === 'events')!.repository;

	let { data }: { data: PageData } = $props();

	function eventName(id: string): string {
		return data.events.find((e) => e.id === id)?.name ?? id;
	}

	function eventHref(id: string): string {
		return localizeUrl(`/events/${id}`);
	}
</script>

<svelte:head>
	<title>{m.events_changelog_page_title()} — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={localizeUrl('/events')} class="link-arrow mb-8 inline-block text-[12px]"
				>{m.collection_changelog_back_to({ collection: m.events_label() })}</a
			>
			<p class="label mb-4">{m.events_label()}</p>
			<h1 class="page-lead mb-10">{m.collection_changelog_title()}</h1>

			<CollectionChangelog
				entries={data.changelog}
				itemName={eventName}
				itemHref={eventHref}
				repository={eventsRepository}
			/>
		</section>
	</main>

	<Footer />
</div>
