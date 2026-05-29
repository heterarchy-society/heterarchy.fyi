<script lang="ts">
	import { Calendar, MapPin } from 'lucide-svelte';
	import {
		enrichEventForList,
		eventPath,
		eventPrimaryHref,
		getFeaturedEvent,
	} from '$lib/data/events';
	import EventPoster from '$lib/components/events/EventPoster.svelte';
	import EventDaysLeft from '$lib/components/events/EventDaysLeft.svelte';
	import { localizeUrl } from '$lib/i18n';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	const event = $derived.by(() => {
		const raw = getFeaturedEvent();
		return raw ? enrichEventForList(raw, getLocale()) : null;
	});
	const detailHref = $derived(event ? localizeUrl(eventPath(event.id)) : null);
	const externalHref = $derived(event ? eventPrimaryHref(event) : undefined);
</script>

{#if event}
	<section>
		<p class="label">{m.featured_event_label()}</p>

		<div class="flex items-start gap-5 sm:gap-10">
			<div class="poster-wrap w-32 shrink-0 sm:w-48">
				<EventPoster {event} size={192} href={detailHref} />
			</div>

			<div class="flex min-w-0 flex-1 flex-col gap-3 pt-1">
				<h2 class="font-mono text-[1.1rem] leading-snug tracking-[-0.01em] sm:text-[1.25rem] lg:text-[1.35rem]">
					{#if detailHref}
						<a href={detailHref} class="no-underline hover:underline">{event.name}</a>
					{:else}
						{event.name}
					{/if}
				</h2>

				<ul class="flex flex-col gap-1.5 font-mono text-[12px]">
					<li class="flex items-center gap-2.5">
						<Calendar size={13} strokeWidth={1.25} />
						<span>
							{event.dateLabelUpcoming}
							{' '}
							<EventDaysLeft {event} />
						</span>
					</li>
					{#if event.locationLabel}
						<li class="flex items-center gap-2.5">
							<MapPin size={13} strokeWidth={1.25} />
							<span>{event.locationLabel}</span>
						</li>
					{/if}
				</ul>

				{#if event.excerpt}
					<p class="hidden max-w-sm text-[14px] leading-[1.55] text-black/60 sm:block">{event.excerpt}</p>
				{/if}
			</div>
		</div>

		{#if event.excerpt}
			<p class="mt-4 text-[14px] leading-[1.55] text-black/60 sm:hidden">{event.excerpt}</p>
		{/if}

	</section>
{/if}

<style>
	.poster-wrap :global(a),
	.poster-wrap :global(div) {
		display: block;
		width: 100%;
	}
	.poster-wrap :global(img) {
		width: 100% !important;
		height: auto !important;
		aspect-ratio: 1;
		object-fit: cover;
		display: block;
	}
</style>
