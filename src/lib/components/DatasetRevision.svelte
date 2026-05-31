<script lang="ts">
	import { getLocale } from '$lib/i18n';
	import { timeAgo } from '$lib/time';
	import * as m from '$lib/paraglide/messages';

	type HistoryEntry = { hash: string; date: string; author: string; message?: string };

	let {
		history = [],
		repository,
		path,
		layout = 'responsive'
	}: {
		/** Commit history, newest first. */
		history?: HistoryEntry[];
		/** Forgejo repository base URL. */
		repository: string;
		/** Path of the item within the repo, e.g. `people/adam-back` or `books/some-id`. */
		path: string;
		/** Use horizontal to keep the mobile row layout on wide screens too. */
		layout?: 'responsive' | 'horizontal';
	} = $props();

	const latest = $derived(history[0] ?? null);
	const historyCount = $derived(history.length);
	const historyHref = $derived(`${repository}/commits/branch/main/${path}`);
	const commitHref = $derived(latest ? `${repository}/commit/${latest.hash}` : historyHref);
	const latestFileHref = $derived(latest ? `${repository}/src/commit/${latest.hash}/${path}/index.yaml` : historyHref);
	const latestHashLabel = $derived(latest?.hash.slice(0, 7).toLowerCase() ?? '');
	const contributors = $derived([...new Set(history.map((h) => h.author).filter(Boolean))]);

	function formatEditDate(iso: string): string {
		return new Date(iso).toLocaleString(getLocale(), {
			day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}

	// Deterministic gravatar identicon from a contributor name (no emails in data yet).
	function gravatarUrl(name: string): string {
		let h = 0;
		for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
		let x = h >>> 0;
		let hex = '';
		while (hex.length < 32) {
			x = (Math.imul(1103515245, x) + 12345) >>> 0;
			hex += x.toString(16).padStart(8, '0');
		}
		return `https://www.gravatar.com/avatar/${hex.slice(0, 32)}?d=identicon&s=40`;
	}
</script>

{#if layout === 'horizontal'}
	<aside class="border-t border-line pt-8">
		<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
			<p class="label mb-0">{m.dataset_revision()}</p>
			{#if latest}
				<a
					href={latestFileHref}
					target="_blank"
					rel="noopener noreferrer"
					class="border border-line px-2 py-1 font-mono text-[10px] normal-case tracking-widest text-black/55 no-underline transition-colors hover:border-black/40 hover:text-black"
				>
					<span class="text-black/25">#</span><span class="tabular-nums">{latestHashLabel}</span>
				</a>
				<a
					href={commitHref}
					target="_blank"
					rel="noopener noreferrer"
					class="font-mono text-[12px] text-black/55 no-underline transition-colors hover:text-black"
					title={formatEditDate(latest.date)}
				>
					{m.dataset_updated({ ago: timeAgo(latest.date, getLocale()) })}
				</a>
				<span class="font-mono text-[11px] text-black/35">{formatEditDate(latest.date)}</span>
			{/if}
			<a
				href={historyHref}
				target="_blank"
				rel="noopener noreferrer"
				class="link-arrow font-mono text-[12px]"
			>
				{#if historyCount > 0}{m.dataset_history_count({ count: String(historyCount) })}{:else}{m.dataset_history()}{/if}
			</a>
		</div>

		{#if contributors.length > 0}
			<div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
				<p class="label mb-0">{m.dataset_contributors()}</p>
				<ul class="flex flex-wrap items-center gap-x-4 gap-y-2">
					{#each contributors as contributor}
						<li class="flex items-center gap-2.5">
							<img
								src={gravatarUrl(contributor)}
								alt={contributor}
								width={24}
								height={24}
								loading="lazy"
								class="size-6 shrink-0 rounded-full border border-line bg-bg-muted"
							/>
							<span class="font-mono text-[12px] text-black/70">{contributor}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</aside>
{:else}
	<aside class="flex flex-row flex-wrap gap-8 border-t border-line pt-8 lg:flex-col lg:flex-nowrap lg:border-l lg:border-t-0 lg:border-line lg:pl-8 lg:pt-0">
		<!-- Revision -->
		<div class="min-w-0 flex-1 lg:flex-none">
			<p class="label mb-3">
				{m.dataset_revision()}{#if latest}
					<a
						href={latestFileHref}
						target="_blank"
						rel="noopener noreferrer"
						class="ml-2 border border-line px-2 py-1 font-mono text-[10px] normal-case tracking-widest text-black/55 no-underline transition-colors hover:border-black/40 hover:text-black"
					>
						<span class="text-black/25">#</span><span class="tabular-nums">{latestHashLabel}</span>
					</a>
				{/if}
			</p>

			{#if latest}
				<a
					href={commitHref}
					target="_blank"
					rel="noopener noreferrer"
					class="block no-underline transition-colors hover:text-black"
					title={formatEditDate(latest.date)}
				>
					<span class="block font-mono text-[12px] leading-snug text-black/70">
						{m.dataset_updated({ ago: timeAgo(latest.date, getLocale()) })}
					</span>
					<span class="mt-0.5 block font-mono text-[11px] text-black/35">
						{formatEditDate(latest.date)}
					</span>
				</a>
			{/if}

			<a
				href={historyHref}
				target="_blank"
				rel="noopener noreferrer"
				class="link-arrow mt-4 block text-[12px]"
			>
				{#if historyCount > 0}{m.dataset_history_count({ count: String(historyCount) })}{:else}{m.dataset_history()}{/if}
			</a>
		</div>

		{#if contributors.length > 0}
			<div class="min-w-0 flex-1 lg:flex-none">
				<p class="label mb-3">{m.dataset_contributors()}</p>
				<ul class="flex flex-col gap-2.5">
					{#each contributors as contributor}
						<li class="flex items-center gap-2.5">
							<img
								src={gravatarUrl(contributor)}
								alt={contributor}
								width={24}
								height={24}
								loading="lazy"
								class="size-6 shrink-0 rounded-full border border-line bg-bg-muted"
							/>
							<span class="font-mono text-[12px] text-black/70">{contributor}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</aside>
{/if}
