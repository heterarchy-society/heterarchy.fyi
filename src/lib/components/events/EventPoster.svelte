<script lang="ts">
	import type { EventItem } from '$lib/data/events';

	const PLACEHOLDER = '/event-placeholder.svg';

	let {
		event,
		size = 168,
		linked = true
	}: {
		event: EventItem;
		size?: number;
		linked?: boolean;
	} = $props();

	const src = $derived(event.posterUrl ?? PLACEHOLDER);
	const isPlaceholder = $derived(!event.posterUrl);
	const hasLink = $derived(linked && Boolean(event.href));
	const isExternal = $derived(Boolean(event.href?.startsWith('http')));
</script>

{#snippet poster()}
	<img
		{src}
		alt={isPlaceholder ? '' : event.title}
		width={size}
		height={size}
		class="aspect-square object-cover"
		style="width: {size}px; height: {size}px"
	/>
{/snippet}

{#if hasLink}
	<a
		href={event.href}
		class="block shrink-0 border border-line"
		target={isExternal ? '_blank' : undefined}
		rel={isExternal ? 'noopener noreferrer' : undefined}
	>
		{@render poster()}
	</a>
{:else}
	<div class="block shrink-0 border border-line">
		{@render poster()}
	</div>
{/if}
