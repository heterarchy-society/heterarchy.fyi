<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import JoinCard from '$lib/components/join/JoinCard.svelte';
	import { joinIntro, joinMeta, joinOptions } from '$lib/data/join';
</script>

<svelte:head>
	<title>{joinMeta.title}</title>
	<meta name="description" content={joinMeta.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">{joinIntro.title}</p>

			<p class="page-lead mb-6">{joinIntro.lead}</p>

			<p class="mb-12 max-w-xl text-[15px] leading-[1.65] text-black/75">{joinIntro.note}</p>

			<div class="grid grid-cols-1 sm:grid-cols-2">
				{#each joinOptions as option, i}
					<JoinCard {option} index={i} total={joinOptions.length} />
				{/each}
			</div>
		</section>
	</main>

	<Footer />
</div>
