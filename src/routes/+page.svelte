<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import GameOfLife from '$lib/components/GameOfLife.svelte';
	import FeaturedEvent from '$lib/components/FeaturedEvent.svelte';
	import LibraryLinks from '$lib/components/LibraryLinks.svelte';
	import Partners from '$lib/components/Partners.svelte';
	import { featuredEvent } from '$lib/data/events';
	import { localizeUrl } from '$lib/i18n';
	import { libraryPreview } from '$lib/data/library';
	import { siteMeta } from '$lib/data/placeholder';
	import { latestWritings, writingAuthorText } from '$lib/data/writings';
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
			<FeaturedEvent event={featuredEvent} />
		</div>
		<div class="cell lg:col-span-1">
			{#if data.glossaryItem}
				<div>
					{#if data.glossaryItem.type}
						<p class="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/30">{data.glossaryItem.type}</p>
					{/if}
					<h2 class="mb-3 font-mono text-[1.1rem] leading-snug">
						<a href={data.glossaryItem.href} class="hover:underline">{data.glossaryItem.name}</a>
					</h2>
					<p class="text-[13px] leading-[1.7] text-black/60">{@html data.glossaryItem.excerptHtml}</p>
					<a href={data.glossaryItem.href} class="mt-3 block font-mono text-[11px] text-black/35 no-underline hover:text-black hover:underline">{m.spotlight_read_more()}</a>
				</div>
			{/if}
		</div>

		<div class="cell-roomy lg:col-span-2 lg:border-r lg:border-line">
			<p class="label mb-6">{m.writings_page_label()}</p>
			<ul class="flex flex-col divide-y divide-line">
				{#each latestWritings as writing (writing.id)}
					<li>
						<a href={localizeUrl(`/writings/${writing.id}`)} class="group block py-5 no-underline first:pt-0">
							<p class="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-black/35">
								{writingAuthorText(writing.authors)}{writing.year ? ` · ${writing.year}` : ''}
							</p>
							<h2 class="font-mono text-[15px] leading-snug text-black underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">{writing.title}</h2>
						</a>
					</li>
				{/each}
			</ul>
			<div class="mt-6 border-t border-line pt-6">
				<a href={localizeUrl('/writings')} class="link-arrow text-[13px]">{m.writings_link()}</a>
			</div>
		</div>
		<div class="cell-roomy lg:col-span-1">
			<LibraryLinks books={libraryPreview} />
			<div class="-mx-8 mt-8 border-t border-line px-8 pt-8 lg:-mx-10 lg:px-10">
				<Partners />
			</div>
		</div>
	</main>

	<Footer />
</div>
