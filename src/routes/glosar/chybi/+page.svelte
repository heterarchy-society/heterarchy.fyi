<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';

	const term = $derived($page.url.searchParams.get('term') ?? '');
	const slug = $derived(term.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
	const fileContent = $derived(`---\nname: ${term}\ntype: concept\nkeywords: []\nresources: []\n---\n\n${term} is ...`);
	const newFileUrl = $derived(
		`https://github.com/heterarchy-society/glossary/new/main/glossary?filename=${encodeURIComponent(slug + '.md')}&value=${encodeURIComponent(fileContent)}`
	);
</script>

<svelte:head>
	<title>Chybějící pojem — Glosář — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href="/glosar" class="link-arrow mb-8 inline-block text-[12px]">← glosář</a>

			<p class="label mb-4">Glosář</p>

			<h1 class="page-lead mb-2">
				{#if term}„{term}"{:else}Chybějící pojem{/if}
			</h1>

			<p class="mb-10 font-mono text-[11px] uppercase tracking-widest text-red-400">Pojem chybí v glosáři</p>

			<div class="max-w-xl text-[15px] leading-[1.7] text-black/80">
				<p class="mb-4">
					Tento pojem je v glosáři odkazován, ale ještě nemá vlastní definici.
					Glosář je otevřený projekt — každý může přidat nový výraz nebo opravit existující.
				</p>
				<p>
					Nové pojmy se přidávají v angličtině. Stačí pár vět — překlad komunita doplní.
				</p>
			</div>

			<div class="mt-10 flex flex-col gap-4 sm:flex-row">
				<a
					href={newFileUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="link-arrow text-[13px]"
				>
					→ přidat anglický pojem na GitHubu
				</a>
				<a
					href="https://github.com/heterarchy-society/glossary"
					target="_blank"
					rel="noopener noreferrer"
					class="link-arrow text-[13px]"
				>
					→ prozkoumat repozitář
				</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
