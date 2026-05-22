<script lang="ts">
	import { bookPath, type LibraryBook } from '$lib/data/library';

	let { books }: { books: LibraryBook[] } = $props();

	const previewItems = $derived(
		books.length > 0
			? books.map((b) => ({ href: bookPath(b.id), src: b.coverUrl ?? '/book-placeholder.svg', alt: b.title }))
			: Array.from({ length: 4 }, (_, i) => ({
					href: '/knihovna',
					src: '/book-placeholder.svg',
					alt: '',
					key: `placeholder-${i}`
				}))
	);
</script>

<section>
	<p class="label">Knihovna</p>

	<div class="mb-5 grid grid-cols-4 gap-2">
		{#each previewItems as item (item.href + item.src)}
			<a href={item.href} class="block no-underline">
				<img
					src={item.src}
					alt={item.alt}
					width={80}
					height={120}
					class="aspect-[2/3] w-full border border-line object-cover transition-opacity hover:opacity-80"
				/>
			</a>
		{/each}
	</div>

	<a href="/knihovna" class="link-arrow text-[13px]">→ knihovna</a>
</section>
