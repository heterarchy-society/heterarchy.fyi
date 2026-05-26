<script lang="ts">
	import { dev, version } from '$app/environment';
	import { Pause, Play } from 'lucide-svelte';
	import { buildInfo } from '$lib/data/build-info';
	import { siteMeta } from '$lib/data/placeholder';
	import { getLocale, localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { timeAgo } from '$lib/time';
	import { mediaPlayer } from '$lib/media/player.svelte';
	import { ambientPlaylist } from '$lib/data/ambient';

	const versionHref =
		buildInfo.commit === 'unknown' ? siteMeta.radicleHref : `${siteMeta.radicleHref}/commits/${buildInfo.commit}`;
	const deployAge = buildInfo.deployedAt === 'unknown' ? 'unknown' : timeAgo(buildInfo.deployedAt, getLocale());

	const isAmbientPlaying = $derived(
		mediaPlayer.playing && ambientPlaylist.some(t => t.id === mediaPlayer.track?.id)
	);
</script>

<footer class="border-t border-line font-mono text-[13px]">
	<div class="flex flex-col gap-3 px-6 py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4 lg:px-8 lg:py-5">

		<!-- logo + version (mobile: one row; desktop: logo only) -->
		<div class="flex items-center justify-between">
			<a href={localizeUrl('/')} class="flex items-center gap-2 no-underline hover:opacity-75">
				<img src="/logo.svg" alt="Heterarchy" class="h-5 w-auto dark:invert" />
				<span>{siteMeta.footerNotice}</span>
			</a>
			<div class="text-[11px] text-black/40 lg:hidden">
				{#if dev}
					{version}-dev
				{:else}
					v{version} · <a href={versionHref} class="link-external" target="_blank" rel="noopener noreferrer">{buildInfo.shortCommit}</a>
				{/if}
			</div>
		</div>

		<!-- nav -->
		<nav class="flex flex-wrap items-center gap-x-1.5 lg:justify-self-center">
			<a href={localizeUrl('/find-us')} class="no-underline hover:underline">{m.footer_where_to_find()}</a>
			<span aria-hidden="true">·</span>
			<a href={localizeUrl('/join')} class="no-underline hover:underline">{m.nav_join()}</a>
			<span aria-hidden="true">·</span>
			<a href={localizeUrl('/open-data')} class="no-underline hover:underline">{m.footer_data()}</a>
			<span aria-hidden="true">·</span>
			<button
				type="button"
				onclick={() => mediaPlayer.togglePlaylist(ambientPlaylist)}
				class="flex h-5 w-5 cursor-pointer items-center justify-center text-black/35 transition-colors hover:text-black"
				aria-label={isAmbientPlaying ? m.ambient_pause() : m.ambient_play()}
			>
				{#if isAmbientPlaying}
					<Pause size={13} strokeWidth={1.7} />
				{:else}
					<Play size={13} strokeWidth={1.7} style="transform: translateX(1px)" />
				{/if}
			</button>
		</nav>

		<!-- version (desktop only) -->
		<div class="hidden lg:block lg:justify-self-end">
			{#if dev}
				{version}-dev
			{:else}
				<span>v{version} · </span>
				<a href={versionHref} class="link-external" target="_blank" rel="noopener noreferrer">{buildInfo.shortCommit}</a>
				<span class="text-black/25">({deployAge})</span>
			{/if}
		</div>

	</div>
</footer>
