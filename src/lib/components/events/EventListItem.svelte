<script lang="ts">
	import { Calendar, Clock, MapPin } from 'lucide-svelte';
	import type { EventItem } from '$lib/data/events';
	import EventPoster from '$lib/components/events/EventPoster.svelte';
	import * as m from '$lib/paraglide/messages';

	let { event, last = false }: { event: EventItem; last?: boolean } = $props();

	const hasLink = $derived(Boolean(event.href));
	const isExternal = $derived(Boolean(event.href?.startsWith('http')));
</script>

<article
	class="border-line py-8 lg:py-10"
	class:border-b={!last}
>
	<div class="flex flex-col gap-8 sm:flex-row sm:items-start">
		<EventPoster {event} size={240} />

		<div class="flex min-w-0 flex-1 flex-col gap-4">
			<h2 class="font-mono text-[1.25rem] leading-snug tracking-[-0.01em] lg:text-[1.35rem]">
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

			<ul class="flex flex-col gap-2 font-mono text-[12px]">
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

			<p class="max-w-xl text-[14px] leading-[1.55]">{event.description}</p>

			{#if hasLink}
				<a
					href={event.href}
					class={isExternal ? 'link-external mt-auto w-fit font-mono text-[13px]' : 'link-arrow mt-auto w-fit text-[13px]'}
					target={isExternal ? '_blank' : undefined}
					rel={isExternal ? 'noopener noreferrer' : undefined}
				>
					{m.featured_event_detail()}
				</a>
			{/if}
		</div>
	</div>
</article>
