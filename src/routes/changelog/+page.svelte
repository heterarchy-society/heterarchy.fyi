<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m.changelog_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.changelog_lead()} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={localizeUrl('/')} class="link-arrow mb-8 inline-block text-[12px]">← home</a>
			<p class="label mb-12">{m.changelog_label()}</p>

			<div class="divide-y divide-line">
				{#each data.entries as entry}
					<div class="changelog-entry py-10 first:pt-0">
						{@html entry.html}
					</div>
				{/each}
			</div>
		</section>
	</main>

	<Footer />
</div>

<style>
	.changelog-entry :global(h1) {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		margin-bottom: 1.5rem;
	}

	.changelog-entry :global(h2) {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--theme-ink) 45%, transparent);
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.changelog-entry :global(ul) {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.changelog-entry :global(li) {
		font-size: 0.9375rem;
		line-height: 1.65;
		padding-left: 1rem;
		position: relative;
	}

	.changelog-entry :global(li::before) {
		content: '–';
		position: absolute;
		left: 0;
		color: color-mix(in srgb, var(--theme-ink) 30%, transparent);
	}

	.changelog-entry :global(li a) {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: color-mix(in srgb, var(--theme-ink) 35%, transparent);
		text-decoration: none;
	}

	.changelog-entry :global(li a:hover) {
		color: color-mix(in srgb, var(--theme-ink) 70%, transparent);
		text-decoration: underline;
	}
</style>
