<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
	import { localizeUrl } from '$lib/i18n';

	const status = $derived($page.status);
	const message = $derived($page.error?.message ?? '');
</script>

<svelte:head>
	<title>{status} — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={localizeUrl('/')} class="link-arrow mb-8 inline-block text-[12px]">← home</a>

			<p class="label mb-4 font-mono">{status}</p>
			<h1 class="page-lead mb-4 font-mono">
				{#if status === 404}Page not found{:else}Something went wrong{/if}
			</h1>

			{#if message}
				<p class="mb-8 font-mono text-[13px] text-black/40">{message}</p>
			{/if}

			<div class="mt-10 flex flex-wrap gap-6 font-mono text-[13px] text-black/50">
				<a href={localizeUrl('/glossary')} class="no-underline hover:text-black hover:underline">glossary</a>
				<a href={localizeUrl('/writings')} class="no-underline hover:text-black hover:underline">writings</a>
				<a href={localizeUrl('/books')} class="no-underline hover:text-black hover:underline">books</a>
				<a href={localizeUrl('/events')} class="no-underline hover:text-black hover:underline">events</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
