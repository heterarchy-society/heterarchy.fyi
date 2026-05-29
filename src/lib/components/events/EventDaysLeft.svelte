<script lang="ts">
	import { eventDaysLeft, type Event } from '$lib/data/events';
	import * as m from '$lib/paraglide/messages';

	let { event }: { event: Event } = $props();

	const days = $derived(eventDaysLeft(event));
</script>

{#if days !== null}
	<span class="text-black/40">
		{#if days === 0}
			{m.events_days_left_today()}
		{:else if days === 1}
			{m.events_one_day_left()}
		{:else}
			{m.events_days_left({ count: String(days) })}
		{/if}
	</span>
{/if}
