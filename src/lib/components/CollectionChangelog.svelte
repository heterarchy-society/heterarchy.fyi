<script lang="ts">
	import { getLocale } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { CollectionChangelogEntry } from '$lib/server/changelog';

	let {
		entries,
		repository,
		itemName,
		itemHref,
		diffHref
	}: {
		entries: CollectionChangelogEntry[];
		repository: string;
		itemName: (id: string) => string;
		itemHref: (id: string) => string;
		diffHref?: (id: string, hash: string) => string | null;
	} = $props();

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString(getLocale(), {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function opLabel(op: string): string {
		return op === 'added' ? m.glossary_changelog_op_added() : m.glossary_changelog_op_modified();
	}
</script>

{#if entries.length > 0}
	<ul class="flex flex-col divide-y divide-line font-mono text-[12px]">
		{#each entries as entry (entry.hash)}
			<li class="py-6">
				<div class="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-black/35">
					<span>{formatDate(entry.date)}</span>
					<span class="text-black/20">·</span>
					<span>{entry.author}</span>
					<span class="text-black/20">·</span>
					<a
						href="https://github.com/{repository}/commit/{entry.hash}"
						target="_blank"
						rel="noopener noreferrer"
						class="no-underline hover:text-black hover:underline"
					>{entry.hash.slice(0, 7)}</a>
				</div>

				{#if entry.message}
					<p class="mb-4 max-w-3xl text-[12px] leading-relaxed text-black/50">{entry.message}</p>
				{/if}

				{#if entry.changes.length > 0}
					<ul class="flex flex-col gap-1.5">
						{#each entry.changes as change}
							{@const diff = diffHref?.(change.id, entry.hash) ?? null}
							<li class="flex flex-wrap items-baseline gap-2">
								<span class="shrink-0 text-[10px] uppercase tracking-wider {change.op === 'added' ? 'text-black/40' : 'text-black/30'}">
									{opLabel(change.op)}
								</span>
								<a href={itemHref(change.id)} class="leading-snug text-black/75 no-underline hover:underline">
									{itemName(change.id)}
								</a>
								{#if diff}
									<a href={diff} class="shrink-0 text-black/30 no-underline hover:text-black hover:underline">(diff)</a>
								{/if}
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-[11px] text-black/30">{m.collection_changelog_no_item_changes()}</p>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p class="font-mono text-[13px] text-black/40">{m.collection_changelog_empty()}</p>
{/if}
