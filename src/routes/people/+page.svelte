<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Only load alt avatar src on first hover — avoids fetching ~200 extra images on page load
	let altLoadedIds = $state(new Set<string>());
	function revealAlt(id: string) {
		if (!altLoadedIds.has(id)) altLoadedIds = new Set([...altLoadedIds, id]);
	}
</script>

<svelte:head>
	<title>{m.people_page_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.people_page_lead()} />
</svelte:head>

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
						<a
							href={localizeUrl(`/people/${person.id}`)}
							class="group block min-w-0 no-underline"
							aria-label={person.name}
							onmouseenter={() => revealAlt(person.id)}
						>
							<article>
								{#if person.avatarUrl}
									<div class="relative aspect-square w-full">
										<img
											src={person.avatarUrl}
											srcset={person.avatarSrcset}
											sizes="(min-width: 1536px) 175px, (min-width: 1280px) 200px, (min-width: 1024px) 240px, (min-width: 640px) 25vw, 50vw"
											alt={m.people_avatar_alt({ name: person.name })}
											class="absolute inset-0 h-full w-full border border-line object-cover transition-opacity duration-300 {person.avatarAltUrl ? 'group-hover:opacity-0' : 'group-hover:opacity-85'}"
											loading="lazy"
											decoding="async"
										/>
										{#if person.avatarAltUrl}
											<img
												src={altLoadedIds.has(person.id) ? person.avatarAltUrl : undefined}
												srcset={altLoadedIds.has(person.id) ? person.avatarAltSrcset : undefined}
												sizes="(min-width: 1536px) 175px, (min-width: 1280px) 200px, (min-width: 1024px) 240px, (min-width: 640px) 25vw, 50vw"
												alt={m.people_avatar_alt({ name: person.name })}
												class="absolute inset-0 h-full w-full border border-line object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
											/>
										{/if}
									</div>
								{:else}
									<div class="aspect-square w-full border border-line bg-bg-muted" aria-hidden="true"></div>
								{/if}

								<h2 class="mt-3 font-mono text-[16px] leading-tight text-black underline decoration-transparent underline-offset-[3px] transition-colors group-hover:decoration-current lg:text-[18px]">
									{person.name}
								</h2>
							</article>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<section class="cell-roomy">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.people_contribute_text()}</p>
			<div class="mt-6 flex flex-wrap gap-x-8 gap-y-3">
				<a href={localizeUrl('/open-data')} class="link-arrow text-[13px]">{m.people_data_link()}</a>
				<a href="https://github.com/heterarchy-society/people" class="link-arrow text-[13px]">git</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
