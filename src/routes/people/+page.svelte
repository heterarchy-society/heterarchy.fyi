<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import PersonTile from '$lib/components/people/PersonTile.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { datasetConfigs } from '$lib/data/datasets';
	import type { PageData } from './$types';

	const peopleRepository = datasetConfigs.find((d) => d.id === 'people')!.repository;

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m.people_page_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.people_page_lead()} />
</svelte:head>

<Seo title="{m.people_page_label()} — The Heterarchy Society" description={m.people_page_lead()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<div class="mb-10">
				<div class="mb-4 flex items-start justify-between gap-4 lg:mb-0">
					<p class="label">{m.people_page_label()}</p>
					{#if data.latestRevision}
						<LatestRevision
							latest={data.latestRevision}
							changelogHref={localizeUrl('/people/changelog')}
						/>
					{/if}
				</div>
				<h1 class="page-lead mb-4">{m.people_page_title()}</h1>
				<p class="max-w-2xl text-[15px] leading-[1.65] text-black/70">{m.people_page_lead()}</p>
			</div>

			{#if data.people.length > 0}
				<div class="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
					{#each data.people as person (person.id)}
						<PersonTile
							href={localizeUrl(`/people/${person.id}`)}
							name={person.name}
							avatarUrl={person.avatarUrl}
							avatarSrcset={person.avatarSrcset}
							avatarAltUrl={person.avatarAltUrl}
							avatarAltSrcset={person.avatarAltSrcset}
							avatarAlt={m.people_avatar_alt({ name: person.name })}
							sizes="(min-width: 1536px) 175px, (min-width: 1280px) 200px, (min-width: 1024px) 240px, (min-width: 640px) 25vw, 50vw"
						/>
					{/each}
				</div>
			{/if}
		</section>

		<section class="cell-roomy">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.people_contribute_text()}</p>
			<div class="mt-6 flex flex-wrap gap-x-8 gap-y-3">
				<a href={localizeUrl('/open-data')} class="link-arrow text-[13px]">{m.people_data_link()}</a>
				<a href={peopleRepository} class="link-arrow text-[13px]">git</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
