<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DiffViewer from '$lib/components/DiffViewer.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const termHref = $derived(localizeUrl(`/glossary/${data.termId}`));
	const history = $derived((data.term as any).history ?? []);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('cs-CZ', {
			day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}

	type HistoryEntry = { hash: string; date: string; author: string; message: string; diff?: string };

	let allEntries = $state<HistoryEntry[]>([]);
	let loadingEntries = $state(false);
	let fetchError = $state<string | null>(null);

	$effect(() => {
		async function fetchHistory() {
			loadingEntries = true;
			fetchError = null;
			try {
				const res = await fetch(`https://glossary.heterarchy.fyi/history/${data.termId}.json`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				allEntries = await res.json();
			} catch (e: any) {
				fetchError = e.message ?? m.glossary_load_error();
			} finally {
				loadingEntries = false;
			}
		}
		fetchHistory();
	});

	const commitHash = $derived(page.url.searchParams.get('commit'));
	const selectedEntry = $derived(
		commitHash ? (allEntries.find(e => e.hash === commitHash) ?? null) : null
	);
</script>

<svelte:head>
	<title>{m.glossary_history_label()} · {data.term.name} — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label mb-4">{m.glossary_history_label()}</p>

			<h1 class="page-lead mb-2">
				<a href={termHref} class="no-underline hover:underline">{data.term.name}</a>
			</h1>
			{#if data.term.type}
				<p class="mb-10 font-mono text-[11px] uppercase tracking-widest text-black/40">{data.term.type}</p>
			{/if}

			{#if selectedEntry}
				<div class="mb-12 border-t border-line pt-8">
					<div class="mb-6 flex items-baseline justify-between gap-4">
						<h2 class="font-mono text-[1rem] leading-snug">
							<span class="text-black/30">[{selectedEntry.hash.slice(0, 7)}]</span>
							{selectedEntry.message}
						</h2>
						<a href="?" class="shrink-0 font-mono text-[11px] text-black/40 no-underline hover:underline hover:text-black">← {m.glossary_history_label()}</a>
					</div>
					<div class="mb-6 flex flex-wrap gap-6 font-mono text-[11px] text-black/40">
						<span>{formatDate(selectedEntry.date)}</span>
						<span>{selectedEntry.author}</span>
						<a
							href="https://github.com/heterarchy-society/glossary/commit/{selectedEntry.hash}"
							target="_blank"
							rel="noopener noreferrer"
							class="link-external hover:text-black"
						>{selectedEntry.hash.slice(0, 7)}</a>
					</div>
					{#if selectedEntry.diff}
						<DiffViewer diff={selectedEntry.diff} />
					{/if}
				</div>
			{:else if loadingEntries}
				<p class="mb-10 font-mono text-[13px] text-black/40">{m.glossary_loading()}</p>
			{:else if fetchError}
				<p class="mb-10 font-mono text-[13px] text-red-600">{fetchError}</p>
			{/if}

			{#if history.length > 0}
				<div class="max-w-4xl overflow-x-auto">
					<table class="w-full font-mono text-[12px]">
						<thead>
							<tr class="border-b border-line text-left text-[10px] uppercase tracking-widest text-black/35">
								<th class="pb-3 pr-6 font-normal">{m.glossary_history_col_hash()}</th>
								<th class="pb-3 pr-6 font-normal">{m.glossary_history_col_author()}</th>
								<th class="pb-3 pr-6 font-normal">{m.glossary_history_col_date()}</th>
								<th class="pb-3 font-normal">{m.glossary_history_col_message()}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-line">
							{#each history as entry}
								{@const isSelected = commitHash === entry.hash}
								<tr
									class="hover:bg-bg-muted cursor-pointer"
									class:bg-bg-muted={isSelected}
									onclick={() => goto(`?commit=${entry.hash}`)}
								>
									<td class="py-3 pr-6 align-top text-black/40">{entry.hash.slice(0, 7)}</td>
									<td class="py-3 pr-6 align-top text-black/60 whitespace-nowrap">{entry.author}</td>
									<td class="py-3 pr-6 align-top text-black/40 whitespace-nowrap">{formatDate(entry.date)}</td>
									<td class="py-3 align-top text-black/80">{entry.message}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="font-mono text-[13px] text-black/40">{m.glossary_no_history()}</p>
			{/if}
		</section>
	</main>

	<Footer />
</div>
