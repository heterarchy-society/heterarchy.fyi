<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CollectionChangelog from '$lib/components/CollectionChangelog.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { datasetConfigs } from '$lib/data/datasets';
	import type { PageData } from './$types';

	const peopleRepository = datasetConfigs.find((d) => d.id === 'people')!.repository;

	let { data }: { data: PageData } = $props();

	function personForId(id: string) {
		return data.people.find((person) => person.id === id);
	}

	function personName(id: string): string {
		return personForId(id)?.name ?? id;
	}

	function personHref(id: string): string {
		return localizeUrl(`/people/${id}`);
	}
</script>

<svelte:head>
	<title>{m.people_changelog_page_title()} — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={localizeUrl('/people')} class="link-arrow mb-8 inline-block text-[12px]">{m.collection_changelog_back_to({ collection: m.people_page_label() })}</a>
			<p class="label mb-4">{m.people_page_label()}</p>
			<h1 class="page-lead mb-10">{m.collection_changelog_title()}</h1>

			<CollectionChangelog
				entries={data.changelog}
				repository={peopleRepository}
				itemName={personName}
				itemHref={personHref}
			/>
		</section>
	</main>

	<Footer />
</div>
