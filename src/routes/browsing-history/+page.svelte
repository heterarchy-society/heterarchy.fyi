<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { getLocale, localizeUrl } from '$lib/i18n';
	import { timeAgo } from '$lib/time';
	import {
		clearPageHistory,
		PAGE_HISTORY_STORAGE_KEY,
		PAGE_HISTORY_UPDATED_EVENT,
		readPageHistory,
		type PageHistoryEntry,
	} from '$lib/page-history';
	import * as m from '$lib/paraglide/messages';

	const SITE_TITLE_SUFFIX = /\s+[—-]\s+The Heterarchy Society$/;

	let entries = $state<PageHistoryEntry[]>([]);
	let relativeTimeTick = $state(Date.now());

	const sortedEntries = $derived(
		[...entries].sort((a, b) => Date.parse(b.lastVisitedAt) - Date.parse(a.lastVisitedAt))
	);
	const totalMs = $derived(entries.reduce((sum, entry) => sum + entry.totalMs, 0));
	const totalVisits = $derived(entries.reduce((sum, entry) => sum + entry.visitCount, 0));
	const latestEntry = $derived(sortedEntries[0] ?? null);

	function refresh(): void {
		entries = readPageHistory();
	}

	function clearAll(): void {
		clearPageHistory();
		entries = [];
	}

	function formatNumber(value: number): string {
		return new Intl.NumberFormat(getLocale()).format(value);
	}

	function formatDuration(ms: number): string {
		const seconds = Math.max(0, Math.round(ms / 1000));
		if (seconds < 1) return m.history_duration_under_second();
		if (seconds < 60) return `${seconds}s`;

		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		if (minutes < 60) {
			return remainingSeconds > 0 && minutes < 10 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
		}

		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString(getLocale(), {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	function formatRelativeTime(iso: string): string {
		relativeTimeTick;
		return timeAgo(iso, getLocale());
	}

	function normalizedRoute(path: string): string {
		const pathname = path.split('?')[0].replace(/\/$/, '') || '/';
		return pathname.replace(/^\/cs(?=\/|$)/, '') || '/';
	}

	function humanizePath(path: string): string {
		const pathname = normalizedRoute(path);
		const slug = pathname.split('/').filter(Boolean).at(-1);
		if (!slug) return m.history_home_page();

		const decoded = readablePath(slug).replace(/[-_]+/g, ' ');
		return decoded.charAt(0).toUpperCase() + decoded.slice(1);
	}

	function isMisappliedHistoryTitle(title: string, path: string): boolean {
		if (normalizedRoute(path) === '/browsing-history') return false;
		return ['Browsing History', 'Local history', 'Historie prohlížení', 'Lokální historie', m.history_label()].includes(title);
	}

	function entryTitle(entry: PageHistoryEntry): string {
		const title = entry.title.replace(SITE_TITLE_SUFFIX, '').trim();
		if (!title || title === 'The Heterarchy Society') return m.history_home_page();
		if (isMisappliedHistoryTitle(title, entry.path)) return humanizePath(entry.path);
		return title;
	}

	function readablePath(path: string): string {
		try {
			return decodeURI(path);
		} catch {
			return path;
		}
	}

	onMount(() => {
		refresh();
		const relativeTimeTimer = window.setInterval(() => {
			relativeTimeTick = Date.now();
		}, 1000);

		const handleHistoryUpdated = () => refresh();
		const handleStorageUpdate = (event: StorageEvent) => {
			if (event.key && event.key !== PAGE_HISTORY_STORAGE_KEY) return;
			refresh();
		};

		window.addEventListener(PAGE_HISTORY_UPDATED_EVENT, handleHistoryUpdated);
		window.addEventListener('storage', handleStorageUpdate);

		return () => {
			window.clearInterval(relativeTimeTimer);
			window.removeEventListener(PAGE_HISTORY_UPDATED_EVENT, handleHistoryUpdated);
			window.removeEventListener('storage', handleStorageUpdate);
		};
	});
</script>

<svelte:head>
	<title>{m.history_page_title()}</title>
	<meta name="description" content={m.history_lead()} />
</svelte:head>

<Seo title={m.history_page_title()} description={m.history_lead()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy border-b border-line">
			<div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<a href={localizeUrl('/')} class="link-arrow mb-8 inline-block text-[12px]">{m.history_back_home()}</a>
					<p class="label mb-6">{m.history_label()}</p>
					<h1 class="max-w-3xl font-mono text-[2rem] leading-[1.15] tracking-[-0.01em] lg:text-[2.75rem]">
						{m.history_title()}
					</h1>
					<p class="mt-6 max-w-2xl text-[15px] leading-[1.7] text-black/70">{m.history_lead()}</p>
				</div>

				<button
					type="button"
					onclick={clearAll}
					disabled={entries.length === 0}
					class="w-fit border border-line px-4 py-2 font-mono text-[12px] text-black/55 transition-colors hover:border-black/30 hover:text-black disabled:cursor-not-allowed disabled:opacity-35"
				>
					{m.history_clear()}
				</button>
			</div>
		</section>

		<section class="grid border-b border-line sm:grid-cols-3">
			<div class="cell-compact">
				<p class="label mb-3">{m.history_stat_pages()}</p>
				<p class="font-mono text-[1.75rem] leading-none">{formatNumber(entries.length)}</p>
			</div>
			<div class="cell-compact sm:border-l sm:border-line">
				<p class="label mb-3">{m.history_stat_visits()}</p>
				<p class="font-mono text-[1.75rem] leading-none">{formatNumber(totalVisits)}</p>
			</div>
			<div class="cell-compact sm:border-l sm:border-line">
				<p class="label mb-3">{m.history_stat_time()}</p>
				<p class="font-mono text-[1.75rem] leading-none">{formatDuration(totalMs)}</p>
				{#if latestEntry}
					<p class="mt-2 font-mono text-[11px] text-black/35">
						{m.history_stat_last()}
						<time datetime={latestEntry.lastVisitedAt} title={formatDate(latestEntry.lastVisitedAt)}>
							{formatRelativeTime(latestEntry.lastVisitedAt)}
						</time>
					</p>
				{/if}
			</div>
		</section>

		<section class="cell-roomy">
			{#if sortedEntries.length === 0}
				<div class="border-y border-line py-10">
					<p class="font-mono text-[13px] text-black/45">{m.history_empty()}</p>
				</div>
			{:else}
				<div class="overflow-x-auto border-y border-line">
					<table class="w-full min-w-[760px] border-collapse font-mono text-[12px]">
						<thead>
							<tr class="border-b border-line text-left text-[10px] uppercase tracking-widest text-black/35">
								<th class="py-3 pr-8 font-normal">{m.history_col_page()}</th>
								<th class="py-3 pr-8 font-normal">{m.history_col_visits()}</th>
								<th class="py-3 pr-8 font-normal">{m.history_col_total_time()}</th>
								<th class="py-3 pr-8 font-normal">{m.history_col_last_time()}</th>
								<th class="py-3 font-normal">{m.history_col_last_visit()}</th>
							</tr>
						</thead>
						<tbody>
							{#each sortedEntries as entry (entry.path)}
								<tr class="border-b border-line align-top last:border-b-0">
									<td class="py-5 pr-8">
										<a href={entry.path} class="text-[13px] text-black no-underline hover:underline">{entryTitle(entry)}</a>
										<span class="mt-1 block max-w-[22rem] truncate text-black/35">{readablePath(entry.path)}</span>
									</td>
									<td class="py-5 pr-8 tabular-nums text-black/65">{formatNumber(entry.visitCount)}</td>
									<td class="py-5 pr-8 tabular-nums text-black/65">{formatDuration(entry.totalMs)}</td>
									<td class="py-5 pr-8 tabular-nums text-black/65">{formatDuration(entry.lastDurationMs)}</td>
									<td class="py-5 tabular-nums text-black/65">
										<time datetime={entry.lastVisitedAt} title={formatDate(entry.lastVisitedAt)}>
											{formatRelativeTime(entry.lastVisitedAt)}
										</time>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	</main>

	<Footer />
</div>
