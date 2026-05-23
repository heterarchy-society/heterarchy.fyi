<script lang="ts">
	import { getLocale } from '$lib/i18n';
	import { timeAgo } from '$lib/time';
	import * as m from '$lib/paraglide/messages';

	let { latest, changelogHref }: {
		latest: { hash: string; date: string };
		changelogHref: string;
	} = $props();

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString(getLocale(), {
			day: 'numeric', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	}
</script>

<div class="shrink-0 text-right font-mono text-[11px] text-black/35">
	<div class="mb-0.5 flex items-baseline justify-end gap-2 text-[9px] uppercase tracking-widest text-black/25">
		<span>{m.latest_revision()}</span>
		<a
			href={changelogHref}
			class="normal-case tracking-normal text-[11px] text-black/35 no-underline hover:text-black tabular-nums"
		>{latest.hash.slice(0, 7)}</a>
	</div>
	<div class="flex items-baseline justify-end gap-1.5 tabular-nums">
		<span>{formatDate(latest.date)}</span>
		<span class="text-black/25">({timeAgo(latest.date, getLocale())})</span>
	</div>
</div>
