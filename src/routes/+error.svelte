<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
	import { localizeUrl } from '$lib/i18n';

	const status = $derived($page.status);
	const message = $derived($page.error?.message ?? '');
	const path = $derived($page.url.pathname);
	const isNotFound = $derived(status === 404);

	const exits = [
		{ label: 'glossary', href: localizeUrl('/glossary'), note: 'concepts, terms, maps' },
		{ label: 'writings', href: localizeUrl('/writings'), note: 'manifestos and essays' },
		{ label: 'books', href: localizeUrl('/books'), note: 'library shelf' },
		{ label: 'events', href: localizeUrl('/events'), note: 'where people gather' },
	];
</script>

<svelte:head>
	<title>{status} — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="border-b border-line px-8 py-10 lg:px-10 lg:py-12">
			<div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
				<div>
					<a href={localizeUrl('/')} class="link-arrow mb-8 inline-block text-[12px]">← home</a>

					<h1 class="max-w-4xl font-mono text-[2.6rem] leading-[1.12] tracking-normal text-black sm:text-[3.8rem] lg:text-[4.6rem] xl:text-[5rem]">
						<span class="mr-4 text-[#b3261e]">{status}</span>
						{#if isNotFound}This route has dissolved.{:else}The system blinked.{/if}
					</h1>

					<p class="mt-7 max-w-3xl text-[16px] leading-[1.75] text-black/65">
						{#if isNotFound}
							Nothing lives at <span class="font-mono text-[13px] text-black/45">{path}</span>. It may have moved, been renamed, or never joined the network in the first place.
						{:else}
							Something unexpected happened while resolving this page. The rest of the site is probably still reachable.
						{/if}
					</p>

					{#if message && !isNotFound}
						<p class="mt-4 font-mono text-[12px] text-black/40">{message}</p>
					{/if}
				</div>

				<div class="font-mono lg:pt-32">
					<div class="border border-line bg-[#f8f7f3] p-5 lg:min-h-64">
						<p class="mb-5 text-[10px] uppercase tracking-[0.2em] text-black/35">route trace</p>
						<div class="space-y-3 overflow-hidden text-[12px] text-black/55">
							<p><span class="text-black">home</span> ── glossary</p>
							<p class="pl-10">├── writings</p>
							<p class="pl-10">├── books</p>
							<p class="pl-10">└── <span class="inline-block max-w-[15rem] truncate align-bottom text-black/30 line-through">{path}</span></p>
							<p class="pt-2 text-black">signal: no consensus</p>
						</div>
					</div>
				</div>
			</div>

			<div class="mx-auto mt-12 grid max-w-6xl border-t border-line font-mono text-[12px] md:grid-cols-4">
				{#each exits as exit}
					<a href={exit.href} class="group border-b border-line py-5 no-underline md:border-r md:px-5 md:last:border-r-0">
						<span class="block text-black group-hover:underline">{exit.label}</span>
						<span class="mt-1 block text-[10px] uppercase tracking-widest text-black/35">{exit.note}</span>
					</a>
				{/each}
			</div>
		</section>
	</main>

	<Footer />
</div>
