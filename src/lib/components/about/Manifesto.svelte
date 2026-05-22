<script lang="ts">
	import sourceEn from '$lib/content/manifesto.md?raw';
	import sourceCs from '$lib/content/translations/cs/manifesto.md?raw';
	import { hashContent, parseFrontmatter } from '$lib/content-hash';
	import { renderMarkdown } from '$lib/markdown';
	import { getLocale } from '$lib/i18n';

	let { labeled = false }: { labeled?: boolean } = $props();

	const translationCs = $derived(parseFrontmatter(sourceCs));
	const sourceHash = $derived(hashContent(sourceEn));
	const body = $derived(
		getLocale() === 'cs' && translationCs.hash === sourceHash ? translationCs.body : sourceEn
	);
	const html = $derived(renderMarkdown(body));
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
