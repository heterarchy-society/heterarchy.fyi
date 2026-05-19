<script lang="ts">
	import { Calendar, Clock, MapPin } from 'lucide-svelte';
	import type { EventItem } from '$lib/data/events';

	let { event, last = false }: { event: EventItem; last?: boolean } = $props();

	const isExternal = $derived(event.href.startsWith('http'));
</script>

<article
	class="border-line py-8 lg:py-10"
	class:border-b={!last}
>
	<div class="flex flex-col gap-8 sm:flex-row sm:items-start">
		<a
			href={event.href}
			class="block shrink-0 border border-line"
			target={isExternal ? '_blank' : undefined}
			rel={isExternal ? 'noopener noreferrer' : undefined}
		>
			<img
				src={event.posterUrl}
				alt={event.title}
				width={168}
				height={168}
				class="aspect-square size-[168px] object-cover"
			/>
		</a>

		<div class="flex min-w-0 flex-1 flex-col gap-4">
			<h2 class="text-[1.35rem] leading-tight font-semibold tracking-[-0.01em]">
				<a
					href={event.href}
					class="no-underline hover:underline"
					target={isExternal ? '_blank' : undefined}
					rel={isExternal ? 'noopener noreferrer' : undefined}
				>
					{event.title}
				</a>
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

			<a
				href={event.href}
				class="link-arrow mt-auto w-fit text-[13px]"
				target={isExternal ? '_blank' : undefined}
				rel={isExternal ? 'noopener noreferrer' : undefined}
			>
				→ detail události
			</a>
		</div>
	</div>
</article>
