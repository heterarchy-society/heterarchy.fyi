<script lang="ts">
	import { MapPin } from 'lucide-svelte';
	import { getLocale, localizeUrl } from '$lib/i18n';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LibraryBookMeta from '$lib/components/library/LibraryBookMeta.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const book = $derived(data.book);
	let coverFailed = $state(false);
	const coverSrc = $derived(coverFailed || !book.coverUrl ? '/book-placeholder.svg' : book.coverUrl);
	const booksHref = $derived(localizeUrl('/books'));

	function glossaryTermName(term: PageData['glossary'][number]): string {
		const cs = term.translations?.cs;
		return getLocale() === 'cs' && cs?.name ? cs.name : term.name;
	}

	function glossaryTermHref(term: PageData['glossary'][number]): string {
		const slug = term.translations?.cs?.slug ?? term.id;
		return localizeUrl(`/glossary/${slug}`);
	}
</script>

<svelte:head>
	<title>{book.title} — {m.books_page_title()}</title>
	<meta name="description" content={book.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy border-b border-line">
			<a href={booksHref} class="link-arrow mb-8 inline-block text-[12px]">{m.books_detail_back()}</a>

			<div class="grid gap-10 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-14">
				<div class="mx-auto w-full max-w-70 lg:mx-0">
					<div class="overflow-hidden border border-line bg-bg-muted">
						<img
							src={coverSrc}
							alt={m.books_detail_cover_alt({ title: book.title })}
							width={280}
							height={420}
							class="aspect-2/3 w-full object-cover"
							onerror={() => (coverFailed = true)}
						/>
					</div>
				</div>

				<div class="min-w-0">
					<p class="label mb-4">{m.books_detail_label()}</p>

					{#if book.year}
						<p class="mb-2 font-mono text-[11px] text-black/50">{book.year}</p>
					{/if}

					<h1 class="book-detail-title mb-3 max-w-2xl">{book.title}</h1>
					<p class="mb-4 font-mono text-[13px] text-black/70">{book.author}</p>

					<LibraryBookMeta {book} fullLanguage />

					{#if book.physical}
						<p class="mt-6 flex items-center gap-2 border border-line px-4 py-3 font-mono text-[12px] text-black/70">
							<MapPin size={14} strokeWidth={1.25} />
							<span>{m.books_detail_physical({ name: 'Bordel', city: 'Praha' })}</span>
						</p>
					{/if}

					<div class="mt-8 max-w-2xl">
						<p class="label mb-3">{m.books_detail_about()}</p>
						<p class="text-[15px] leading-[1.7] text-black/80">{book.description}</p>
					</div>

					{#if book.links.length > 0}
						<div class="mt-8">
							<p class="label mb-3">{m.books_detail_where_to_read()}</p>
							<ul class="flex flex-col gap-3">
								{#each book.links as link}
									<li>
										<a
											href={link.href}
											class={link.external ? 'link-external font-mono text-[13px]' : 'link-arrow text-[13px]'}
											target={link.external ? '_blank' : undefined}
											rel={link.external ? 'noopener noreferrer' : undefined}
										>
											{link.label}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if data.glossary.length > 0}
						<div class="mt-8 flex flex-wrap gap-2">
							{#each data.glossary as term}
								<a
									href={glossaryTermHref(term)}
									class="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-black/55 no-underline hover:border-black/40 hover:text-black"
								>
									{glossaryTermName(term)}
								</a>
							{/each}
						</div>
					{/if}

					{#if book.source}
						<p class="mt-10 font-mono text-[11px] text-black/45">
							{m.books_detail_recommended_in()}
							<a href={book.source.href} class="link-external" target="_blank" rel="noopener noreferrer">
								{book.source.name}
							</a>
						</p>
					{/if}
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
