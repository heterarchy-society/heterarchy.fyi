<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import EventListItem from '$lib/components/events/EventListItem.svelte';
	import { localizeUrl } from '$lib/i18n';
	import { events } from '$lib/data/events';
	import * as m from '$lib/paraglide/messages';

	const confirmed = events.filter((e) => !e.preparation);
	const inPreparation = events.filter((e) => e.preparation);
</script>

<svelte:head>
	<title>{m.events_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.events_lead()} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">{m.events_label()}</p>

			<p class="page-lead mb-10">{m.events_lead()}</p>

			<div>
				{#each confirmed as event, i}
					<p class="text-[1.1rem] tracking-[-0.01em] text-black" class:mt-12={i > 0} style="margin-bottom: -1.5rem;">
						{event.date}
					</p>
					<EventListItem {event} last={i === confirmed.length - 1} />
				{/each}
			</div>
		</section>

		{#if inPreparation.length > 0}
			<section class="cell-roomy">
				<p class="label mb-6">{m.events_in_preparation()}</p>

				<ul class="flex flex-col">
					{#each inPreparation as event, i}
						<li class="border-line font-mono py-6" class:border-t={i > 0}>
							<p class="text-[1rem] leading-snug tracking-[-0.01em]">
								{#if event.href}
									<a href={event.href} target="_blank" rel="noopener noreferrer" class="no-underline hover:underline">{event.title}</a>
								{:else}
									{event.title}
								{/if}
							</p>
							<p class="mt-1 text-[12px] text-black/50">{event.date} · {event.location}</p>
							<p class="mt-2 max-w-xl text-[13px] leading-[1.55] text-black/60">{event.description}</p>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="cell-roomy">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.events_cta_text()}</p>
			<a href={localizeUrl('/join')} class="link-arrow mt-6 inline-block text-[13px]">{m.events_cta_link()}</a>
		</section>
	</main>

	<Footer />
</div>
