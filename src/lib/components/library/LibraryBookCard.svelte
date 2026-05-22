<script lang="ts">
	import { bookPath, type LibraryBook } from '$lib/data/library';
	import LibraryBookMeta from './LibraryBookMeta.svelte';

	let { book, large = false }: { book: LibraryBook; large?: boolean } = $props();

	let coverFailed = $state(false);

	const coverSrc = $derived(coverFailed || !book.coverUrl ? '/book-placeholder.svg' : book.coverUrl);
	const href = $derived(bookPath(book.id));
</script>

<a {href} class="group flex h-full flex-col no-underline text-inherit">
	<div
		class="relative mb-4 overflow-hidden border border-line bg-bg-muted transition-colors group-hover:border-black/40"
		class:mb-5={large}
	>
		<img
			src={coverSrc}
			alt="Obálka: {book.title}"
			width={large ? 320 : 240}
			height={large ? 480 : 360}
			class="aspect-[2/3] w-full object-cover"
			onerror={() => (coverFailed = true)}
		/>
	</div>

	<div class="flex flex-1 flex-col">
		<p class="mb-1 font-mono text-[10px] text-black/50">
			{#if book.year}{book.year}{/if}
		</p>

		<h2
			class="mb-1 font-mono leading-snug tracking-[-0.01em] break-words group-hover:underline"
			class:text-[1.05rem]={large}
			class:text-[13px]={!large}
		>
			{book.title}
		</h2>

		<p class="mb-2 font-mono text-[11px] text-black/65">{book.author}</p>

		<LibraryBookMeta {book} />

		<p class="link-arrow mt-auto pt-3 text-[11px]">→ detail</p>
	</div>
</a>
