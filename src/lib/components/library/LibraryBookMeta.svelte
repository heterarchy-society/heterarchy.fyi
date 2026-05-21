<script lang="ts">
	import { formatLabels, languageLabels, type LibraryBook } from '$lib/data/library';

	let { book, fullLanguage = false }: { book: LibraryBook; fullLanguage?: boolean } = $props();

	const languageText = $derived(
		book.language
			.map((code) => (fullLanguage ? languageLabels[code] : code.toUpperCase()))
			.join(', ')
	);

	const formatText = $derived(book.formats.map((f) => formatLabels[f]).join(', '));
</script>

<p class="font-mono text-[10px] tracking-wide text-black/55 uppercase">
	<span>{languageText}</span>
	<span class="text-black/35"> · </span>
	<span>{formatText}</span>
	{#if book.physical}
	{/if}
</p>
