<script lang="ts">
	import { Calendar, Clock, MapPin } from 'lucide-svelte';
	import type { EventItem } from '$lib/data/events';
	import EventPoster from '$lib/components/events/EventPoster.svelte';
	import * as m from '$lib/paraglide/messages';

	let { event }: { event: EventItem } = $props();

	const hasLink = $derived(Boolean(event.href));
	const isExternal = $derived(Boolean(event.href?.startsWith('http')));
</script>

<section>
	<p class="label">{m.featured_event_label()}</p>

	<div class="flex items-start gap-5 sm:gap-10">
		<div class="poster-wrap w-32 shrink-0 sm:w-48">
			<EventPoster {event} size={192} />
		</div>

		<div class="flex min-w-0 flex-1 flex-col gap-3 pt-1">
			<h2 class="font-mono text-[1.1rem] leading-snug tracking-[-0.01em] sm:text-[1.25rem] lg:text-[1.35rem]">
				{#if hasLink}
					<a
						href={event.href}
						class={isExternal ? 'link-external' : 'no-underline hover:underline'}
						target={isExternal ? '_blank' : undefined}
						rel={isExternal ? 'noopener noreferrer' : undefined}
					>
						{event.title}
					</a>
				{:else}
					{event.title}
				{/if}
			</h2>

			<ul class="flex flex-col gap-1.5 font-mono text-[12px]">
				<li class="flex items-center gap-2.5">
					<Calendar size={13} strokeWidth={1.25} />
					<span>{event.date}</span>
				</li>
				<li class="flex items-center gap-2.5">
					<Clock size={13} strokeWidth={1.25} />
					<span>{event.time}</span>
				</li>
				<li class="flex items-center gap-2.5">
					<MapPin size={13} strokeWidth={1.25} />
					<span>{event.location}</span>
				</li>
			</ul>

			{#if event.description}
				<p class="hidden max-w-sm text-[14px] leading-[1.55] sm:block">{event.description}</p>
			{/if}

		</div>
	</div>

	{#if event.description}
		<p class="mt-4 text-[14px] leading-[1.55] sm:hidden">{event.description}</p>
	{/if}
</section>

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
