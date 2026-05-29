<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import GameOfLife from '$lib/components/GameOfLife.svelte';
	import FeaturedEvent from '$lib/components/FeaturedEvent.svelte';
	import LibraryLinks from '$lib/components/LibraryLinks.svelte';
	import Partners from '$lib/components/Partners.svelte';
	import { localizeUrl } from '$lib/i18n';
	import { libraryPreview } from '$lib/data/library';
	import { siteMeta } from '$lib/data/placeholder';
	import { latestWritings, writingAuthorRefs, writingExcerpt } from '$lib/data/writings';
	import { personAvatarUrl } from '$lib/data/people';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{siteMeta.title}</title>
	<meta name="description" content={m.site_description()} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main class="grid lg:grid-cols-3">
		<div class="cell-compact lg:col-span-2 lg:border-r lg:border-line">
			<Hero />
		</div>
		<div class="cell-compact flex h-full min-h-0 flex-col p-0 lg:col-span-1">
			<GameOfLife />
		</div>

		<div id="udalosti" class="cell lg:col-span-2 lg:border-r lg:border-line">
			<FeaturedEvent />
		</div>
		<div class="cell lg:col-span-1">
			{#if data.glossaryItem}
				<div class="flex h-full flex-col">
					<div class="mb-2 flex items-center justify-between gap-4">
						{#if data.glossaryItem.type}
							<p class="font-mono text-[10px] uppercase tracking-widest text-black/20">{data.glossaryItem.type}</p>
						{:else}
							<span></span>
						{/if}
						<p class="font-mono text-[10px] uppercase tracking-widest text-black">{m.glossary_term_of_the_day()}</p>
					</div>
					<h2 class="mb-3 font-mono text-[1.1rem] leading-snug">
						<a href={data.glossaryItem.href} class="hover:underline">{data.glossaryItem.name}</a>
					</h2>
					<p class="text-[13px] leading-[1.7] text-black/60">{@html data.glossaryItem.excerptHtml}</p>
					<a href={data.glossaryItem.href} class="mt-4 font-mono text-[11px] text-black/35 no-underline hover:text-black hover:underline">{m.spotlight_read_more()}</a>
				</div>
			{/if}
		</div>

		<div class="cell lg:col-span-2 lg:border-r lg:border-line">
			<p class="label mb-6">{m.writings_page_label()}</p>
			<ul class="flex flex-col divide-y divide-line">
				{#each latestWritings as writing (writing.id)}
					{@const authors = writingAuthorRefs(writing.authors)}
					{@const excerpt = writingExcerpt(writing)}
					{@const meta = [authors.map(a => a.person?.name ?? a.name).join(', '), writing.year, writing.type].filter(Boolean).join(' · ')}
					<li class="py-6 first:pt-0">
						<a href={localizeUrl(`/writings/${writing.id}`)} class="group block no-underline">
							<div class="mb-2 flex items-center gap-2">
								{#each authors as author}
									{#if author.person}
										{@const avatarUrl = personAvatarUrl(author.person)}
										{#if avatarUrl}
											<img
												src={avatarUrl}
												alt={author.person.name}
												width={20}
												height={20}
												class="size-5 border border-line object-cover"
											/>
										{/if}
									{/if}
								{/each}
								<p class="font-mono text-[11px] text-black/35">{meta}</p>
							</div>
							<h2 class="font-mono text-[19px] leading-snug text-black underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
								{writing.title}
							</h2>
							{#if excerpt}
								<p class="mt-2 max-w-2xl text-[13px] leading-[1.65] text-black/50">{excerpt}</p>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
			<div class="mt-10 border-t border-line pt-6">
				<a href={localizeUrl('/writings')} class="link-arrow text-[13px]">{m.writings_link()}</a>
			</div>
		</div>
		<div class="cell lg:col-span-1">
			<LibraryLinks books={libraryPreview} />
			<div class="-mx-8 mt-8 border-t border-line px-8 pt-8 lg:-mx-10 lg:px-10">
				<Partners />
			</div>
		</div>
	</main>

	<Footer />
</div>
