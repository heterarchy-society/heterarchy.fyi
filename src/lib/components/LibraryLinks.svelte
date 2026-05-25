<script lang="ts">
	import { localizeUrl } from '$lib/i18n';
	import { bookPath, type LibraryBook } from '$lib/data/library';
	import * as m from '$lib/paraglide/messages';

	let { books }: { books: LibraryBook[] } = $props();

	const booksHref = $derived(localizeUrl('/books'));

	const previewItems = $derived(
		books.length > 0
			? books.map((b) => ({
					href: localizeUrl(bookPath(b.id)),
					src: b.coverUrl ?? '/book-placeholder.svg',
					srcset: b.coverVersions ? Object.entries(b.coverVersions).map(([w, url]) => `${url} ${w}`).join(', ') : undefined,
					alt: b.title
				}))
			: Array.from({ length: 4 }, (_, i) => ({
					href: booksHref,
					src: '/book-placeholder.svg',
					srcset: undefined,
					alt: '',
					key: `placeholder-${i}`
				}))
	);
</script>

<section>
	<p class="label">{m.books_label()}</p>

	<div class="mb-5 grid grid-cols-4 gap-2">
		{#each previewItems as item (item.href + item.src)}
			<a href={item.href} class="block no-underline">
				<img
					src={item.src}
					srcset={item.srcset}
					sizes="80px"
					alt={item.alt}
					width={80}
					height={120}
					class="aspect-2/3 w-full border border-line object-cover transition-opacity hover:opacity-80"
					loading="lazy"
				/>
			</a>
		{/each}
	</div>

	<a href={booksHref} class="link-arrow text-[13px]">{m.books_link()}</a>
</section>
