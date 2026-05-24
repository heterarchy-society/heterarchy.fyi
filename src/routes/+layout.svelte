<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppVersionWatcher from '$lib/components/AppVersionWatcher.svelte';
	import UniversalMediaPlayer from '$lib/components/UniversalMediaPlayer.svelte';
	import { mediaPlayer } from '$lib/media/player.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-bg">
	<AppVersionWatcher />
	{@render children()}
	{#if mediaPlayer.track}
		<div class={mediaPlayer.minimized ? 'h-16 sm:h-0' : 'h-20'}></div>
	{/if}
	<UniversalMediaPlayer />
</div>
