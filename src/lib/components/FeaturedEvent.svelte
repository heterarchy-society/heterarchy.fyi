<script lang="ts">
	import { Calendar, Clock, MapPin } from 'lucide-svelte';
	import type { FeaturedEvent } from '$lib/data/placeholder';

	let { event }: { event: FeaturedEvent } = $props();
</script>

<section>
	<p class="label">Doporučená událost</p>

	<div class="flex flex-col gap-8 sm:flex-row sm:items-start">
		<div class="poster-grain flex h-[210px] w-[155px] shrink-0 flex-col items-center justify-center px-3">
			{#each event.posterLines as line}
				<span class="font-mono text-[11px] leading-[1.2] font-bold tracking-wide text-white uppercase">
					{line}
				</span>
			{/each}
		</div>

		<div class="flex min-w-0 flex-1 flex-col gap-4 pt-1">
			<h2 class="text-[1.35rem] leading-tight font-semibold tracking-[-0.01em]">{event.title}</h2>

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

			<p class="max-w-md text-[14px] leading-[1.55]">{event.description}</p>

			<a href={event.href} class="link-arrow mt-auto w-fit text-[13px]">→ detail události</a>
		</div>
	</div>
</section>
