<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DiffViewer from '$lib/components/DiffViewer.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type HistoryEntry = {
		hash: string;
		date: string;
		author: string;
		message: string;
		diff?: string;
	};

	let entry = $state<HistoryEntry | null>(null);
	let loading = $state(true);
	let fetchError = $state<string | null>(null);

	const historyHref = $derived(localizeUrl(`/glossary/${data.termId}/history`));

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('cs-CZ', {
			day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}

	$effect(() => {
		async function load() {
			loading = true;
			fetchError = null;
			try {
				const res = await fetch(`https://glossary.heterarchy.fyi/history/${data.termId}.json`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const history: HistoryEntry[] = await res.json();
				entry = history.find((e) => e.hash === data.commitHash || e.hash.startsWith(data.commitHash)) ?? null;
				if (!entry) throw new Error('Commit not found');
			} catch (e: any) {
				fetchError = e.message ?? m.glossary_load_error();
			} finally {
				loading = false;
			}
		}
		load();
	});
</script>

<svelte:head>
	<title>{data.commitHash.slice(0, 7)} · {m.glossary_history_label()} — The Heterarchy Society</title>
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={historyHref} class="label mb-4 inline-block hover:underline">{m.glossary_history_back({ name: data.termName })}</a>

			{#if loading}
				<p class="font-mono text-[13px] text-black/40">{m.glossary_loading()}</p>
			{:else if fetchError}
				<p class="font-mono text-[13px] text-red-600">{fetchError}</p>
			{:else if entry}
				<h1 class="page-lead mb-2"><span class="text-black/30">[{entry.hash.slice(0, 7)}]</span> {entry.message}</h1>

				<div class="mb-10 flex flex-wrap gap-6 font-mono text-[11px] text-black/40">
					<span>{formatDate(entry.date)}</span>
					<span>{entry.author}</span>
					<a
						href="https://github.com/heterarchy-society/glossary/commit/{entry.hash}"
						target="_blank"
						rel="noopener noreferrer"
						class="link-external hover:text-black"
					>{entry.hash.slice(0, 7)}</a>
				</div>

				{#if entry.diff}
					<DiffViewer diff={entry.diff} />
				{/if}
			{/if}
		</section>
	</main>

	<Footer />
</div>
