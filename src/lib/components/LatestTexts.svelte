<script lang="ts">
	import type { TextArticle } from '$lib/data/placeholder';
	import TextCard from './TextCard.svelte';

	let { articles }: { articles: TextArticle[] } = $props();
</script>

<section id="texty">
	<p class="label">Nejnovější texty</p>

	<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-black">
		{#each articles as article}
			<TextCard {article} />
		{/each}
	</div>
</section>
