<script lang="ts">
	import type { UpcomingEvent } from '$lib/data/placeholder';

	let { events }: { events: UpcomingEvent[] } = $props();
</script>

<section>
	<p class="label">Nadcházející události</p>

	<ul class="font-mono text-[13px]">
		{#each events as event, i}
			<li class:border-b-0={i === events.length - 1} class="border-b border-black">
				<a
					href={event.href}
					class="grid grid-cols-[3rem_1fr_1rem] items-start gap-4 py-4 no-underline hover:underline"
				>
					<span class="pt-px leading-none">{event.date}</span>
					<div class="min-w-0">
						<p class="leading-snug">{event.title}</p>
						<p class="mt-1 text-[11px] leading-snug">{event.location}</p>
					</div>
					<span class="justify-self-end pt-px">→</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
