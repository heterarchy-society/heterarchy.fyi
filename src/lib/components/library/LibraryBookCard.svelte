<script lang="ts">
	import { localizeUrl } from '$lib/i18n';
	import { bookPath, type LibraryBook } from '$lib/data/library';
	import LibraryBookMeta from './LibraryBookMeta.svelte';
	import * as m from '$lib/paraglide/messages';

	let { book, large = false, compact = false }: { book: LibraryBook; large?: boolean; compact?: boolean } = $props();

	let coverFailed = $state(false);

	const coverSrc = $derived(coverFailed || !book.coverUrl ? '/book-placeholder.svg' : book.coverUrl);
	const href = $derived(localizeUrl(bookPath(book.id)));
</script>

<a
	{href}
	class="group flex h-full no-underline text-inherit"
	class:flex-col={!compact}
	class:flex-row={compact}
	class:gap-4={compact}
>
	<div
		class="relative overflow-hidden border border-line bg-bg-muted transition-colors group-hover:border-black/40"
		class:mb-4={!compact}
		class:mb-5={large && !compact}
		class:w-24={compact}
		class:shrink-0={compact}
	>
		<img
			src={coverSrc}
			alt={m.books_detail_cover_alt({ title: book.title })}
			width={compact ? 96 : large ? 320 : 240}
			height={compact ? 144 : large ? 480 : 360}
			class="aspect-2/3 w-full object-cover"
			onerror={() => (coverFailed = true)}
		/>
	</div>

	<div class="flex min-w-0 flex-1 flex-col">
		<p class="mb-1 font-mono text-[10px] text-black/50" class:mt-0.5={compact}>
			{#if book.year}{book.year}{/if}
		</p>

		<h2
			class="mb-1 font-mono leading-snug tracking-[-0.01em] wrap-break-word group-hover:underline"
			class:text-[1.05rem]={large}
			class:text-[13px]={!large && !compact}
			class:text-[15px]={compact}
		>
			{book.title}
		</h2>

		<p class="mb-2 font-mono text-[11px] text-black/65">{book.author}</p>

		<LibraryBookMeta {book} />

	</div>
</a>
