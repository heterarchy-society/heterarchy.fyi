<script lang="ts">
	import type { LibraryBook } from '$lib/data/library';
	import * as m from '$lib/paraglide/messages';

	let { book, fullLanguage = false }: { book: LibraryBook; fullLanguage?: boolean } = $props();

	const formatMap = $derived({
		ebook: m.books_format_ebook(),
		pdf: m.books_format_pdf(),
		web: m.books_format_web(),
		print: m.books_format_print(),
	});

	const languageMap = $derived({
		en: m.books_language_en(),
		cs: m.books_language_cs(),
		de: m.books_language_de(),
	});

	const languageText = $derived(
		book.language
			.map((code) => (fullLanguage ? languageMap[code] : code.toUpperCase()))
			.join(', ')
	);

	const formatText = $derived(book.formats.map((f) => formatMap[f]).join(', '));
</script>

<p class="font-mono text-[10px] tracking-wide text-black/55 uppercase">
	<span>{languageText}</span>
	<span class="text-black/35"> · </span>
	<span>{formatText}</span>
</p>
