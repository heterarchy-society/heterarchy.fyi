<script lang="ts">
	import type { TextArticle } from '$lib/data/placeholder';
	import TextCard from './TextCard.svelte';

	let { articles }: { articles: TextArticle[] } = $props();
</script>

<section id="texty">
	<p class="label">Nejnovější texty</p>

	<div>
		{#each articles as article, i}
			<TextCard {article} last={i === articles.length - 1} />
		{/each}
	</div>
</section>
