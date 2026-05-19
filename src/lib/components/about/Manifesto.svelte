<script lang="ts">
	import manifestoSource from '$lib/content/manifesto.md?raw';
	import { renderMarkdown } from '$lib/markdown';

	let { labeled = false }: { labeled?: boolean } = $props();

	const html = renderMarkdown(manifestoSource);
</script>

{#if labeled}
	<section id="manifesto">
		<article class="manifesto-prose max-w-2xl">
			{@html html}
		</article>
	</section>
{:else}
	<section class="cell-roomy">
		<article class="manifesto-prose max-w-2xl">
			{@html html}
		</article>
	</section>
{/if}
