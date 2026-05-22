<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const cs = $derived((data.term as any).translations?.cs ?? null);
	const termSlug = $derived(cs?.slug ?? data.term.id);
	const history = $derived((data.term as any).history ?? []);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('cs-CZ', {
			day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Historie · {data.term.name} — Glosář — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label mb-4">Glosář · Historie</p>

			<h1 class="page-lead mb-2">
				<a href="/glosar/{termSlug}" class="no-underline hover:underline">{data.term.name}</a>
			</h1>
			{#if data.term.type}
				<p class="mb-10 font-mono text-[11px] uppercase tracking-widest text-black/40">{data.term.type}</p>
			{/if}

			{#if history.length > 0}
				<div class="max-w-4xl overflow-x-auto">
					<table class="w-full font-mono text-[12px]">
						<thead>
							<tr class="border-b border-line text-left text-[10px] uppercase tracking-widest text-black/35">
								<th class="pb-3 pr-6 font-normal">Hash</th>
								<th class="pb-3 pr-6 font-normal">Autor</th>
								<th class="pb-3 pr-6 font-normal">Datum</th>
								<th class="pb-3 font-normal">Zpráva</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-line">
							{#each history as entry}
								<tr class="hover:bg-bg-muted">
									<td class="py-3 pr-6 align-top">
										<a href="/glosar/{data.termId}/historie/{entry.hash}" class="text-black/40 hover:text-black no-underline hover:underline">
											{entry.hash.slice(0, 7)}
										</a>
									</td>
									<td class="py-3 pr-6 align-top text-black/60 whitespace-nowrap">{entry.author}</td>
									<td class="py-3 pr-6 align-top text-black/40 whitespace-nowrap">{formatDate(entry.date)}</td>
									<td class="py-3 align-top text-black/80">
										<a href="/glosar/{data.termId}/historie/{entry.hash}" class="no-underline hover:underline">
											{entry.message}
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="font-mono text-[13px] text-black/40">Žádná historie k dispozici.</p>
			{/if}
		</section>
	</main>

	<Footer />
</div>
