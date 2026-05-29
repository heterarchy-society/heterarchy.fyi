<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { datasetConfigs } from '$lib/data/datasets';
	import EventDaysLeft from '$lib/components/events/EventDaysLeft.svelte';
	import type { PageData } from './$types';

	const eventsRepository = datasetConfigs.find((d) => d.id === 'events')!.repository;

	let { data }: { data: PageData } = $props();

	type EventItem = PageData['past'][number];

	const pastByYear = $derived.by(() => {
		const map = new Map<string, EventItem[]>();
		for (const event of data.past) {
			const year = event.date.slice(0, 4);
			if (!map.has(year)) map.set(year, []);
			map.get(year)!.push(event);
		}
		return [...map.entries()].map(([year, events]) => ({ year, events }));
	});

</script>

<svelte:head>
	<title>{m.events_page_title()} — The Heterarchy Society</title>
	<meta name="description" content={m.events_page_lead()} />
</svelte:head>

<Seo title="{m.events_page_title()} — The Heterarchy Society" description={m.events_page_lead()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy border-b border-line">
			<div class="mb-4 flex items-start justify-between gap-4 lg:mb-0">
				<p class="label">{m.events_label()}</p>
				{#if data.latestRevision}
					<LatestRevision
						latest={data.latestRevision}
						changelogHref={localizeUrl('/events/changelog')}
					/>
				{/if}
			</div>
			<h1 class="page-lead mb-4">{m.events_page_title()}</h1>
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.events_page_lead()}</p>
		</section>

		<!-- Upcoming events -->
		<section class="border-b border-line">
			<div class="px-8 pb-0 pt-8 lg:px-10">
				<p class="font-mono text-[11px] uppercase tracking-widest text-black/35">
					{m.upcoming_events_label()}
				</p>
			</div>

			{#if data.upcoming.length === 0}
				<p class="px-8 py-8 text-[14px] text-black/40 lg:px-10">{m.upcoming_events_empty()}</p>
			{:else}
				<div class="divide-y divide-line">
					{#each data.upcoming as event (event.id)}
						{@const blurb = event.excerpt}
						<a
							href={localizeUrl(`/events/${event.id}`)}
							class="group block px-8 py-6 no-underline lg:px-10"
						>
							<div class="flex items-start gap-6 sm:gap-8">
								{#if event.cardImageUrl}
									<img
										src={event.cardImageUrl}
										srcset={event.cardImageSrcset}
										sizes="(min-width: 640px) 160px, 120px"
										alt=""
										width={160}
										height={160}
										class="size-[120px] shrink-0 border border-line object-cover sm:size-[160px]"
										loading="lazy"
										decoding="async"
									/>
								{/if}
								<div class="min-w-0 flex-1">
									<p class="mb-1 font-mono text-[13px] font-medium text-black/60">
										{event.dateLabelUpcoming}
										{' '}
										<EventDaysLeft {event} />
									</p>
									<h2 class="font-mono text-[19px] leading-snug text-black underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current sm:text-[21px]">
										{event.name}
									</h2>
									{#if event.locationLabel}
										<p class="mt-1 font-mono text-[12px] text-black/40">{event.locationLabel}</p>
									{/if}
									{#if blurb}
										<p class="mt-3 hidden max-w-xl text-[14px] leading-[1.6] text-black/55 sm:block">{blurb}</p>
									{/if}
								</div>
							</div>
							{#if blurb}
								<p class="mt-4 max-w-2xl text-[14px] leading-[1.6] text-black/55 sm:hidden">{blurb}</p>
							{/if}
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Past events grouped by year -->
		{#each pastByYear as { year, events } (year)}
			<section class="border-b border-line">
				<div class="flex items-baseline gap-6 px-8 pb-2 pt-8 lg:px-10">
					<h2 class="font-mono text-[28px] font-medium leading-none text-black/20">{year}</h2>
					<span class="font-mono text-[11px] text-black/25">{events.length}</span>
				</div>

				<div class="divide-y divide-line/50">
					{#each events as event (event.id)}
						<a
							href={localizeUrl(`/events/${event.id}`)}
							class="group flex items-center gap-4 px-8 py-3 no-underline sm:gap-6 lg:px-10"
						>
							<span class="w-16 shrink-0 font-mono text-[12px] leading-snug text-black/40 sm:w-24">
								{event.dateLabelCompact}
							</span>
							<span class="min-w-0 flex-1 font-mono text-[14px] leading-snug text-black underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-current sm:text-[15px]">
								{event.name}
							</span>
							{#if event.locationLabel}
								<span class="hidden shrink-0 font-mono text-[12px] text-black/35 sm:block">
									{event.locationLabel}
								</span>
							{/if}
							{#if event.major}
								<span class="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-black/25 md:block">
									{m.events_filter_major()}
								</span>
							{/if}
						</a>
					{/each}
				</div>
			</section>
		{/each}

		<p class="px-8 py-6 font-mono text-[11px] text-black/35 lg:px-10">
			{m.events_count({ count: String(data.past.length + data.upcoming.length) })}
		</p>

		<section class="cell-roomy border-t border-line">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.events_contribute_text()}</p>
			<div class="mt-6 flex flex-wrap gap-x-8 gap-y-3">
				<a href={localizeUrl('/open-data')} class="link-arrow text-[13px]">{m.events_data_link()}</a>
				<a href={eventsRepository} class="link-arrow text-[13px]">git</a>
				<a href={localizeUrl('/join')} class="link-arrow text-[13px]">{m.events_cta_link()}</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
