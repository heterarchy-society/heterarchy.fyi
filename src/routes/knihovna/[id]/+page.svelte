<script lang="ts">
	import { MapPin } from 'lucide-svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LibraryBookMeta from '$lib/components/library/LibraryBookMeta.svelte';
	import { formatLabels, languageLabels, libraryLocation } from '$lib/data/library';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const book = $derived(data.book);
	let coverFailed = $state(false);
	const coverSrc = $derived(coverFailed ? '/book-placeholder.svg' : book.coverUrl);
</script>

<svelte:head>
	<title>{book.title} — Knihovna</title>
	<meta name="description" content={book.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy border-b border-line">
			<a href="/knihovna" class="link-arrow mb-8 inline-block text-[12px]">← knihovna</a>

			<div class="grid gap-10 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-14">
				<div class="mx-auto w-full max-w-[280px] lg:mx-0">
					<div class="overflow-hidden border border-line bg-bg-muted">
						<img
							src={coverSrc}
							alt="Obálka: {book.title}"
							width={280}
							height={420}
							class="aspect-[2/3] w-full object-cover"
							onerror={() => (coverFailed = true)}
						/>
					</div>
				</div>

				<div class="min-w-0">
					<p class="label mb-4">Kniha</p>

					{#if book.year}
						<p class="mb-2 font-mono text-[11px] text-black/50">{book.year}</p>
					{/if}

					<h1 class="book-detail-title mb-3 max-w-2xl">{book.title}</h1>
					<p class="mb-4 font-mono text-[13px] text-black/70">{book.author}</p>

					<LibraryBookMeta {book} fullLanguage />

					<dl class="mt-6 grid gap-4 border-t border-line pt-6 font-mono text-[12px] sm:grid-cols-2">
						<div>
							<dt class="label mb-1">Jazyk</dt>
							<dd class="text-black/75">
								{book.language.map((l) => languageLabels[l]).join(', ')}
							</dd>
						</div>
						<div>
							<dt class="label mb-1">Formáty</dt>
							<dd class="text-black/75">
								{book.formats.map((f) => formatLabels[f]).join(', ')}
							</dd>
						</div>
					</dl>

					{#if book.physical}
						<p
							class="mt-6 flex items-center gap-2 border border-line px-4 py-3 font-mono text-[12px] text-black/70"
						>
							<MapPin size={14} strokeWidth={1.25} />
							<span
								>Fyzická kopie v {libraryLocation.name}, {libraryLocation.city}</span
							>
						</p>
					{/if}

					<div class="mt-8 max-w-2xl">
						<p class="label mb-3">O knize</p>
						<p class="text-[15px] leading-[1.7] text-black/80">{book.description}</p>
					</div>

					{#if book.links.length > 0}
						<div class="mt-8">
							<p class="label mb-3">Kde číst / koupit</p>
							<ul class="flex flex-col gap-3">
								{#each book.links as link}
									<li>
										<a
											href={link.href}
											class="link-arrow text-[13px]"
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

					{#if book.source}
						<p class="mt-10 font-mono text-[11px] text-black/45">
							Doporučeno v katalogu
							<a href={book.source.href} class="underline" target="_blank" rel="noopener noreferrer">
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
