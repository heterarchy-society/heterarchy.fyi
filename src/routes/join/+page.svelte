<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import JoinCard from '$lib/components/join/JoinCard.svelte';
	import { joinOptions } from '$lib/data/join';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.join_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.join_lead()} />
</svelte:head>

<Seo title="{m.join_label()} — The Heterarchy Society" description={m.join_lead()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">{m.join_label()}</p>

			<p class="page-lead mb-12">{m.join_lead()}</p>

			<div class="grid grid-cols-1 sm:grid-cols-2">
				{#each joinOptions as option, i}
					<JoinCard {option} index={i} total={joinOptions.length} />
				{/each}
			</div>
		</section>
	</main>

	<Footer />
</div>
