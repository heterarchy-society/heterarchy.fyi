<script lang="ts">
	import type { EventItem } from '$lib/data/events';
	import * as m from '$lib/paraglide/messages';

	let { events }: { events: EventItem[] } = $props();
</script>

{#snippet eventRow(event: EventItem, linked: boolean)}
	<span class="pt-px leading-snug">{event.date}</span>
	<div class="min-w-0">
		<p class="font-mono leading-snug" class:group-hover:underline={linked}>{event.title}</p>
		{#if event.location && event.location !== 'TBD'}
			<p class="mt-1 text-[11px] leading-snug text-black/60">{event.location}</p>
		{/if}
		{#if event.preparation}
			<span class="mt-1 inline-block font-mono text-[10px] uppercase tracking-wider text-black/40">{m.upcoming_events_in_preparation()}</span>
		{/if}
	</div>
	{#if linked}
		<span class="justify-self-end pt-px group-hover:underline">→</span>
	{/if}
{/snippet}

<section>
	<p class="label">{m.upcoming_events_label()}</p>

	{#if events.length === 0}
		<p class="font-mono text-[12px] text-black/50">{m.upcoming_events_empty()}</p>
	{:else}
		<ul class="font-mono text-[13px]">
			{#each events as event, i}
				{@const hasLink = Boolean(event.href) && !event.preparation}
				{@const external = Boolean(event.href?.startsWith('http'))}
				<li class:border-b-0={i === events.length - 1} class="border-b border-line">
					{#if hasLink}
						<a
							href={event.href}
							class="group grid grid-cols-[7rem_1fr_auto] items-start gap-4 py-4 no-underline"
							target={external ? '_blank' : undefined}
							rel={external ? 'noopener noreferrer' : undefined}
						>
							{@render eventRow(event, true)}
						</a>
					{:else}
						<div class="grid grid-cols-[7rem_1fr] items-start gap-4 py-4">
							{@render eventRow(event, false)}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
