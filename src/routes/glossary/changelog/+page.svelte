<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import CollectionChangelog from '$lib/components/CollectionChangelog.svelte';
	import { getLocale, localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { datasetConfigs } from '$lib/data/datasets';
	import type { PageData } from './$types';

	const glossaryRepository = datasetConfigs.find((d) => d.id === 'glossary')!.repository;

	let { data }: { data: PageData } = $props();

	function termForId(id: string) {
		return data.terms.find((term) => term.id === id);
	}

	function termName(id: string): string {
		const term = termForId(id);
		if (!term) return id;
		return (term as any).translations?.[getLocale()]?.name ?? term.name;
	}

	function termHref(id: string): string {
		const term = termForId(id);
		const slug = (term as any)?.translations?.[getLocale()]?.slug ?? id;
		return localizeUrl(`/glossary/${slug}`);
	}

	function diffHref(id: string, hash: string): string {
		return `${localizeUrl(`/glossary/${id}/history`)}?commit=${hash}`;
	}
</script>

<svelte:head>
	<title>{m.glossary_changelog_page_title()} — The Heterarchy Society</title>
</svelte:head>

<Seo title="{m.glossary_changelog_page_title()} — The Heterarchy Society" description={m.glossary_lead()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={localizeUrl('/glossary')} class="link-arrow mb-8 inline-block text-[12px]">{m.collection_changelog_back_to({ collection: m.glossary_label() })}</a>
			<p class="label mb-4">{m.glossary_label()}</p>
			<h1 class="page-lead mb-10">{m.collection_changelog_title()}</h1>

			<CollectionChangelog
				entries={data.changelog}
				repository={glossaryRepository}
				itemName={termName}
				itemHref={termHref}
				diffHref={diffHref}
			/>
		</section>
	</main>

	<Footer />
</div>
