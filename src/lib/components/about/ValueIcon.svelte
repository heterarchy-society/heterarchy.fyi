<script lang="ts">
	import type { ValueItem } from '$lib/data/about';

	let { icon }: { icon: ValueItem['icon'] } = $props();
</script>

<svg
	viewBox="0 0 48 48"
	class="h-12 w-12 shrink-0"
	aria-hidden="true"
	fill="none"
	stroke="currentColor"
	stroke-width="1.25"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#if icon === 'circle'}
		<path
			d="M24 8c-6 2-11 7-12 14-1 8 5 16 12 18 7-2 13-10 12-18-1-7-6-12-12-14z"
			style="stroke-dasharray: 2 3"
		/>
	{:else if icon === 'star'}
		<line x1="24" y1="6" x2="24" y2="42" />
		<line x1="6" y1="24" x2="42" y2="24" />
		<line x1="11" y1="11" x2="37" y2="37" />
		<line x1="37" y1="11" x2="11" y2="37" />
	{:else if icon === 'squares'}
		<rect x="10" y="14" width="18" height="18" rx="1" transform="rotate(-8 19 23)" />
		<rect x="22" y="18" width="18" height="18" rx="1" transform="rotate(6 31 27)" />
	{:else}
		<circle cx="16" cy="20" r="2" fill="currentColor" stroke="none" />
		<circle cx="24" cy="14" r="2.5" fill="currentColor" stroke="none" />
		<circle cx="32" cy="22" r="2" fill="currentColor" stroke="none" />
		<circle cx="22" cy="30" r="1.5" fill="currentColor" stroke="none" />
		<circle cx="30" cy="32" r="2" fill="currentColor" stroke="none" />
		<circle cx="18" cy="34" r="1.5" fill="currentColor" stroke="none" />
	{/if}
</svg>
