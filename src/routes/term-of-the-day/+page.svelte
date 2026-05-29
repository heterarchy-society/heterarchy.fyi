<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { localizeUrl } from '$lib/i18n';
	import { termForDate, termPool, termHistoryDates } from '$lib/data/term-of-day';
	import * as m from '$lib/paraglide/messages';

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: currentYear - 2026 + 1 }, (_, i) => 2026 + i);

	let selectedYear = $state(currentYear);

	function localDateLabel(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	const today = localDateLabel(new Date());

	const days = $derived(() => {
		const result: { label: string; name: string; id: string; isToday: boolean; isPast: boolean }[] = [];
		const start = new Date(selectedYear, 0, 1);
		const future30 = new Date(); future30.setDate(future30.getDate() + 30);
		const yearEnd = new Date(selectedYear, 11, 31);
		const end = future30 < yearEnd ? future30 : yearEnd;
		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			const label = localDateLabel(d);
			const term = termForDate(d);
			result.push({ label, name: term.name, id: term.id, isToday: label === today, isPast: termHistoryDates.has(label) && label < today });
		}
		return result;
	});

	const hiddenCount = $derived(days().filter((d) => d.isPast).length - 3);
	let showPast = $state(false);

	const visible = $derived(() => {
		const all = days();
		const past = all.filter((d) => d.isPast);
		const cutoff = past.at(-(3))?.label ?? '';
		return all.filter((d) => {
			if (d.label < today && !d.isPast) return false; // pre-today, not in history
			if (d.isPast) return showPast || d.label >= cutoff;
			return true;
		});
	});
</script>

<svelte:head>
	<title>{m.term_of_day_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<h1 class="mb-3 font-mono text-[1.5rem] leading-tight">{m.term_of_day_title()}</h1>
			<p class="mb-8 max-w-lg text-[13px] leading-[1.7] text-black/55">
				{m.term_of_day_desc({ count: termPool.length })}
			</p>

			<div class="mb-6 flex flex-wrap items-baseline gap-6">
				<div class="flex gap-3">
					{#each years as y}
						<button
							onclick={() => { selectedYear = y; showPast = false; }}
							class="font-mono text-[12px] {selectedYear === y ? 'text-black underline' : 'text-black/35 hover:text-black hover:underline'}"
						>
							{y}
						</button>
					{/each}
				</div>
				{#if hiddenCount > 0}
					<button
						onclick={() => (showPast = !showPast)}
						class="font-mono text-[11px] text-black/40 hover:text-black hover:underline"
					>
						{showPast ? m.term_of_day_hide_past() : m.term_of_day_show_past({ count: hiddenCount })}
					</button>
				{/if}
			</div>

			<div class="divide-y divide-line max-w-sm">
				{#each visible() as { label, name, id, isToday, isPast }}
					<div class="flex items-baseline gap-6 py-2 first:pt-0">
						<span class="font-mono text-[12px] shrink-0 {isToday ? 'text-black' : isPast ? 'text-black/25' : 'text-black/40'}">{label}</span>
						<a href={localizeUrl(`/glossary/${id}`)} class="font-mono text-[13px] hover:underline {isToday ? 'font-bold' : isPast ? 'text-black/40' : ''}">{name}</a>
						{#if isToday}<span class="font-mono text-[11px] text-black/30">{m.term_of_day_today()}</span>{/if}
					</div>
				{/each}
			</div>

			<p class="mt-8 font-mono text-[11px] text-black/30">{m.term_of_day_pool({ count: termPool.length })}</p>
		</section>
	</main>

	<Footer />
</div>
