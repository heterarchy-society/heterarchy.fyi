<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import GameOfLife from '$lib/components/GameOfLife.svelte';
	import FeaturedEvent from '$lib/components/FeaturedEvent.svelte';
	import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
	import Manifesto from '$lib/components/about/Manifesto.svelte';
	import LibraryLinks from '$lib/components/LibraryLinks.svelte';
	import { featuredEvent, upcomingEvents } from '$lib/data/events';
	import { libraryPreview } from '$lib/data/library';
	import { siteMeta } from '$lib/data/placeholder';
</script>

<svelte:head>
	<title>{siteMeta.title}</title>
	<meta name="description" content={siteMeta.description} />
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
			<UpcomingEvents events={upcomingEvents} />
		</div>

		<div class="cell-roomy lg:col-span-2 lg:border-r lg:border-line">
			<Manifesto labeled />
		</div>
		<div class="cell-roomy lg:col-span-1">
			<LibraryLinks books={libraryPreview} />
		</div>
	</main>

	<Footer />
</div>
