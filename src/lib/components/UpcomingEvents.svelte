<script lang="ts">
	import type { EventListItem } from '$lib/data/events';
	import { eventPath } from '$lib/data/events';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';

	let { events }: { events: EventListItem[] } = $props();
</script>

{#snippet eventRow(event: EventListItem, linked: boolean)}
	<span class="pt-px leading-snug">{event.dateLabelUpcoming}</span>
	<div class="min-w-0">
		<p class="font-mono leading-snug" class:group-hover:underline={linked}>
			{event.name}
		</p>
		{#if event.locationLabel}
			<p class="mt-1 text-[11px] leading-snug text-black/60">{event.locationLabel}</p>
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
				<li class:border-b-0={i === events.length - 1} class="border-b border-line">
					<a
						href={localizeUrl(eventPath(event.id))}
						class="group grid grid-cols-[7rem_1fr_auto] items-start gap-4 py-4 no-underline"
					>
						{@render eventRow(event, true)}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>
