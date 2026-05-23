<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppVersionWatcher from '$lib/components/AppVersionWatcher.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-bg">
	<AppVersionWatcher />
	{@render children()}
</div>
