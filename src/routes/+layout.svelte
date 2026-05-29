<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppVersionWatcher from '$lib/components/AppVersionWatcher.svelte';
	import NavigationProgress from '$lib/components/NavigationProgress.svelte';
	import PageHistoryTracker from '$lib/components/PageHistoryTracker.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import UniversalMediaPlayer from '$lib/components/UniversalMediaPlayer.svelte';
	import { page } from '$app/state';
	import { mediaPlayer } from '$lib/media/player.svelte';

	let { children } = $props();

	const isOnTrackPage = $derived(mediaPlayer.track?.href ? isTrackPage(page.url.pathname, mediaPlayer.track.href) : false);
	const showPlayerSpacer = $derived(Boolean(mediaPlayer.track && !(mediaPlayer.track.isVideo && isOnTrackPage)));

	function isTrackPage(pathname: string, href: string): boolean {
		const path = pathname.replace(/\/$/, '');
		const target = href.replace(/\/$/, '');
		return path === target || path.endsWith(target);
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-bg">
	<AppVersionWatcher />
	<PageHistoryTracker />
	<NavigationProgress />
	<SearchModal />
	{@render children()}
	{#if showPlayerSpacer}
		<div class={mediaPlayer.minimized ? 'h-16 sm:h-0' : 'h-20'}></div>
	{/if}
	<UniversalMediaPlayer />
</div>
