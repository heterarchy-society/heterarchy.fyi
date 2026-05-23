<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import GameOfLife from '$lib/components/GameOfLife.svelte';
	import FeaturedEvent from '$lib/components/FeaturedEvent.svelte';
	import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
	import Manifesto from '$lib/components/about/Manifesto.svelte';
	import LibraryLinks from '$lib/components/LibraryLinks.svelte';
	import Partners from '$lib/components/Partners.svelte';
	import { featuredEvent, upcomingEvents } from '$lib/data/events';

	const sidebarEvents = upcomingEvents.filter((e) => e.date !== 'TBD');
	import { libraryPreview } from '$lib/data/library';
	import { siteMeta } from '$lib/data/placeholder';
	import * as m from '$lib/paraglide/messages';
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
			<UpcomingEvents events={sidebarEvents} />
		</div>

		<div class="cell-roomy lg:col-span-2 lg:border-r lg:border-line">
			<Manifesto labeled />
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
