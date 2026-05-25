<script lang="ts">
	import { Search } from 'lucide-svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let query = $state('');

	const filteredPeople = $derived(
		data.people.filter((person) => {
			const needle = query.trim().toLowerCase();
			if (!needle) return true;
			const refs = Object.values(person.refs ?? {}).join(' ');
			const aliases = person.altNames?.join(' ') ?? '';
			return `${person.name} ${aliases} ${person.caption ?? ''} ${person.description ?? ''} ${refs}`
				.toLowerCase()
				.includes(needle);
		})
	);

	const isSearching = $derived(query.trim().length > 0);
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

			<div class="mb-10">
				<label class="sr-only" for="people-search">{m.people_search_label()}</label>
				<div class="relative max-w-md">
					<Search
						size={14}
						strokeWidth={1.25}
						class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-black/40"
						aria-hidden="true"
					/>
					<input
						id="people-search"
						type="search"
						bind:value={query}
						placeholder={m.people_search_placeholder()}
						class="w-full border-0 border-b border-line bg-transparent py-2 pr-8 pl-5 font-mono text-[13px] outline-none placeholder:text-black/40 focus:border-black"
					/>
					{#if isSearching}
						<button
							type="button"
							class="absolute top-1/2 right-0 -translate-y-1/2 font-mono text-[11px] text-black/45 hover:text-black"
							onclick={() => (query = '')}
						>
							{m.people_search_cancel()}
						</button>
					{/if}
				</div>
				{#if isSearching}
					<p class="mt-3 font-mono text-[11px] text-black/50">
						{m.people_search_showing({ count: String(filteredPeople.length), total: String(data.people.length) })}
					</p>
				{/if}
			</div>

			{#if filteredPeople.length > 0}
				<div class="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
					{#each filteredPeople as person (person.id)}
						<a
							href={localizeUrl(`/people/${person.id}`)}
							class="group block min-w-0 no-underline"
							aria-label={person.name}
						>
							<article>
								{#if person.avatarUrl}
									<div class="relative aspect-square w-full">
										<img
											src={person.avatarUrl}
											alt={m.people_avatar_alt({ name: person.name })}
											class="absolute inset-0 h-full w-full border border-line object-cover transition-opacity duration-300 {person.avatarAltUrl ? 'group-hover:opacity-0' : 'group-hover:opacity-85'}"
											loading="lazy"
										/>
										{#if person.avatarAltUrl}
											<img
												src={person.avatarAltUrl}
												alt={m.people_avatar_alt({ name: person.name })}
												class="absolute inset-0 h-full w-full border border-line object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
												loading="lazy"
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
			{:else}
				<p class="py-12 font-mono text-[13px] text-black/55">
					{m.people_no_results()}
				</p>
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
