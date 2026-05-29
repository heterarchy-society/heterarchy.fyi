<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { page } from '$app/stores';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { datasetConfigs } from '$lib/data/datasets';

	const glossaryRepository = datasetConfigs.find((d) => d.id === 'glossary')!.repository;

	const term = $derived($page.url.searchParams.get('term') ?? '');
	const slug = $derived(term.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
	const fileContent = $derived(`---\nname: ${term}\ntype: concept\nkeywords: []\nresources: []\n---\n\n${term} is ...`);
	const newFileUrl = $derived(
		`${glossaryRepository}/_new/main/glossary?filename=${encodeURIComponent(slug + '.md')}&value=${encodeURIComponent(fileContent)}`
	);
	const glossaryHref = $derived(localizeUrl('/glossary'));
</script>

<svelte:head>
	<title>{m.glossary_missing_title_generic()} — {m.glossary_label()} — The Heterarchy Society</title>
</svelte:head>

<Seo title="{m.glossary_missing_title_generic()} — {m.glossary_label()} — The Heterarchy Society" description={m.glossary_lead()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={glossaryHref} class="link-arrow mb-8 inline-block text-[12px]">← {m.glossary_label()}</a>

			<p class="label mb-4">{m.glossary_missing_label()}</p>

			<h1 class="page-lead mb-2">
				{#if term}{m.glossary_missing_title({ term })}{:else}{m.glossary_missing_title_generic()}{/if}
			</h1>

			<p class="mb-10 font-mono text-[11px] uppercase tracking-widest text-red-400">{m.glossary_missing_subtitle()}</p>

			<div class="max-w-xl text-[15px] leading-[1.7] text-black/80">
				<p class="mb-4">{m.glossary_missing_body_1()}</p>
				<p>{m.glossary_missing_body_2()}</p>
			</div>

			<div class="mt-10 flex flex-col gap-4 sm:flex-row">
				<a href={newFileUrl} target="_blank" rel="noopener noreferrer" class="link-external font-mono text-[13px]">
					{m.glossary_missing_add()}
				</a>
				<a href={glossaryRepository} target="_blank" rel="noopener noreferrer" class="link-external font-mono text-[13px]">
					{m.glossary_missing_explore()}
				</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
