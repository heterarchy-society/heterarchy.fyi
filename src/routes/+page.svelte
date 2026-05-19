<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import NetworkGraphic from '$lib/components/NetworkGraphic.svelte';
	import FeaturedEvent from '$lib/components/FeaturedEvent.svelte';
	import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
	import LatestTexts from '$lib/components/LatestTexts.svelte';
	import LibraryLinks from '$lib/components/LibraryLinks.svelte';
	import {
		featuredEvent,
		latestTexts,
		libraryLinks,
		siteMeta,
		upcomingEvents
	} from '$lib/data/placeholder';
</script>

<svelte:head>
	<title>{siteMeta.title}</title>
	<meta name="description" content={siteMeta.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main class="grid lg:grid-cols-3">
		<div class="cell lg:col-span-2 lg:border-r">
			<Hero />
		</div>
		<div class="cell lg:col-span-1">
			<NetworkGraphic />
		</div>

		<div id="udalosti" class="cell lg:col-span-2 lg:border-r">
			<FeaturedEvent event={featuredEvent} />
		</div>
		<div class="cell lg:col-span-1">
			<UpcomingEvents events={upcomingEvents} />
		</div>

		<div class="cell lg:col-span-2 lg:border-r">
			<LatestTexts articles={latestTexts} />
		</div>
		<div class="cell lg:col-span-1">
			<LibraryLinks links={libraryLinks} />
		</div>
	</main>

	<Footer />
</div>
