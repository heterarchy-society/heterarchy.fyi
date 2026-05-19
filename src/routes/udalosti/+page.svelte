<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import EventListItem from '$lib/components/events/EventListItem.svelte';
	import { events, eventsIntro, eventsMeta } from '$lib/data/events';
</script>

<svelte:head>
	<title>{eventsMeta.title}</title>
	<meta name="description" content={eventsMeta.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">Události</p>

			<p class="page-lead mb-10">{eventsIntro.lead}</p>

			<div>
				{#each events as event, i}
					<EventListItem {event} last={i === events.length - 1} />
				{/each}
			</div>
		</section>

		<section class="cell-roomy">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">
				Máš nápad na formát nebo termín? Uspořádej událost s námi.
			</p>
			<a href="/zapojit-se" class="link-arrow mt-6 inline-block text-[13px]">→ zapojit se</a>
		</section>
	</main>

	<Footer />
</div>
