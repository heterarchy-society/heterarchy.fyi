<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import TalkCard from '$lib/components/talks/TalkCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { localizeUrl } from '$lib/i18n';
	import { eventPrimaryHref, isUpcomingEvent } from '$lib/data/events';
	import EventDaysLeft from '$lib/components/events/EventDaysLeft.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const event = $derived(data.event);
	const primaryHref = $derived(eventPrimaryHref(event));

	function refHref(kind: string, value: string): string {
		if (/^https?:\/\//.test(value)) return value;
		if (kind === 'luma') return `https://lu.ma/${value}`;
		return value;
	}

	function refLabel(kind: string, value: string): string {
		if (kind === 'web') {
			try {
				return new URL(value).hostname.replace(/^www\./, '');
			} catch {
				return 'web';
			}
		}
		if (kind === 'luma') return 'Luma';
		if (kind === 'meetup') return 'Meetup';
		return kind.replace(/_/g, ' ');
	}

	const refEntries = $derived(
		Object.entries(event.refs ?? {}).filter(
			(entry): entry is [string, string] => Boolean(entry[1]) && entry[0] !== 'meetup_id'
		)
	);

	const hasExtra = $derived(
		!!data.descriptionHtml ||
		data.speakers.length > 0 ||
		(event.organizers?.length ?? 0) > 0 ||
		!!event.aftermovie ||
		data.talks.length > 0
	);

	const isBanner = $derived(event.heroImageType === 'banner');
	const sideImageUrl = $derived(isBanner ? event.cardImageUrl : (event.heroImageUrl ?? event.cardImageUrl));
	const sideImageSrcset = $derived(isBanner ? event.cardImageSrcset : (event.heroImageSrcset ?? event.cardImageSrcset));
</script>

<svelte:head>
	<title>{event.name} — {m.events_label()}</title>
	<meta name="description" content={event.caption ?? event.description?.slice(0, 160) ?? m.events_page_lead()} />
</svelte:head>

<Seo
	title="{event.name} — {m.events_label()}"
	description={event.caption ?? event.description?.slice(0, 160) ?? m.events_page_lead()}
	image={event.heroImageUrl ?? event.cardImageUrl}
/>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="border-b border-line">
<div class="cell-roomy">
			<div
				class="grid gap-10 lg:gap-14"
				class:lg:grid-cols-[minmax(180px,240px)_1fr]={!!sideImageUrl}
			>
				{#if sideImageUrl}
					<div class="mx-auto w-full max-w-60 lg:mx-0">
						<img
							src={sideImageUrl}
							srcset={sideImageSrcset}
							sizes="(min-width: 1024px) 240px, 60vw"
							alt={event.name}
							class="w-full border border-line"
						/>
					</div>
				{/if}

				<div class="min-w-0">
					<a href={localizeUrl('/events')} class="label mb-4 inline-block no-underline hover:underline">
						{m.events_detail_back()}
					</a>

					<p class="mb-2 font-mono text-[13px] leading-snug text-black/50">
						{event.dateLabelLong}
						{#if isUpcomingEvent(event)}
							{' '}
							<EventDaysLeft {event} />
						{/if}
					</p>
					<h1 class="book-detail-title mb-4 max-w-2xl">{event.name}</h1>

					{#if event.caption}
						<p class="mb-6 max-w-2xl text-[15px] leading-[1.65] text-black/65">{event.caption}</p>
					{/if}

					<ul class="mb-6 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[12px] text-black/45">
						{#if event.timeLabel}
							<li>{event.timeLabel}</li>
						{/if}
						{#if event.locationLabel}
							<li>{event.locationLabel}</li>
						{/if}
						{#if event.langs?.length}
							<li>{event.langs.join(', ')}</li>
						{/if}
					</ul>

					{#if refEntries.length > 0}
						<ul class="flex flex-wrap gap-x-5 gap-y-2">
							{#each refEntries as [kind, value]}
								<li>
									<a
										href={refHref(kind, value)}
										class="link-external font-mono text-[13px]"
										target="_blank"
										rel="noopener noreferrer"
									>
										{refLabel(kind, value)}
									</a>
								</li>
							{/each}
						</ul>
					{:else if primaryHref}
						<a
							href={primaryHref}
							class="link-external font-mono text-[13px]"
							target="_blank"
							rel="noopener noreferrer"
						>
							{m.featured_event_detail()}
						</a>
					{/if}
				</div>
			</div>
			</div>
		</section>

		{#if hasExtra}
			<section class="cell-roomy">
				{#if data.descriptionHtml}
					<div class="mb-10 max-w-2xl">
						<p class="label mb-4">{m.events_detail_about()}</p>
						<div
							class="text-[15px] leading-[1.7] text-black/80 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-line [&_a:hover]:decoration-black/60 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic"
						>
							{@html data.descriptionHtml}
						</div>
					</div>
				{/if}

				{#if data.speakers.length > 0}
					<div class="mb-10">
						<p class="label mb-4">{m.events_detail_speakers()}</p>
						<p class="font-mono text-[14px] leading-relaxed">
							{#each data.speakers as speaker, i}
								{#if i > 0}<span class="text-black/25"> · </span>{/if}
								{#if speaker.type === 'person'}
									<a href={localizeUrl(`/people/${speaker.id}`)} class="hover:underline">{speaker.name}</a>
								{:else}
									{speaker.label}
								{/if}
							{/each}
						</p>
					</div>
				{/if}

				{#if event.organizers?.length}
					<div class="mb-10">
						<p class="label mb-4">{m.events_detail_organizers()}</p>
						<ul class="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[14px] text-black/70">
							{#each event.organizers as org}
								<li>{org}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if event.aftermovie}
					<div class="mb-10">
						<p class="label mb-4">{m.events_detail_aftermovie()}</p>
						<div class="aspect-video max-w-3xl overflow-hidden border border-line">
							<iframe
								title={event.name}
								src="https://www.youtube-nocookie.com/embed/{event.aftermovie}?rel=0&modestbranding=1"
								class="h-full w-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					</div>
				{/if}

				{#if data.talks.length > 0}
					<div class="mb-10 border-t border-line pt-10">
						<p class="label mb-6">{m.events_detail_talks()}</p>
						<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{#each data.talks as talk (talk.id)}
								<TalkCard {talk} />
							{/each}
						</div>
					</div>
				{/if}
			</section>
		{/if}
	</main>

	<Footer />
</div>
