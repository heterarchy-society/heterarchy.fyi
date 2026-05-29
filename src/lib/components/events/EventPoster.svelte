<script lang="ts">
	import type { EventListItem } from '$lib/data/events';

	const PLACEHOLDER = '/event-placeholder.svg';

	let {
		event,
		size = 168,
		href = undefined,
		linked = true
	}: {
		event: EventListItem;
		size?: number;
		href?: string | null;
		linked?: boolean;
	} = $props();

	const src = $derived(event.cardImageUrl ?? PLACEHOLDER);
	const isPlaceholder = $derived(!event.cardImageUrl);
	const linkHref = $derived(linked ? (href ?? undefined) : undefined);
	const isExternal = $derived(Boolean(linkHref?.startsWith('http')));
</script>

{#snippet poster()}
	<img
		{src}
		srcset={event.cardImageSrcset}
		sizes="{size}px"
		alt={isPlaceholder ? '' : event.name}
		width={size}
		height={size}
		class="aspect-square object-cover"
		style="width: {size}px; height: {size}px"
		loading="lazy"
		decoding="async"
	/>
{/snippet}

{#if linkHref}
	<a
		href={linkHref}
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
