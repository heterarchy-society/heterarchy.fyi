<script lang="ts">
	import { page } from '$app/state';

	let {
		title,
		description,
		image = null,
		type = 'website',
	}: {
		title: string;
		description: string;
		image?: string | null;
		type?: string;
	} = $props();

	const url = $derived(`${page.url.origin}${page.url.pathname}`);
	const siteName = 'The Heterarchy Society';
</script>

<svelte:head>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:site_name" content={siteName} />
	{#if image}
		<meta property="og:image" content={image} />
	{/if}
	<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if image}
		<meta name="twitter:image" content={image} />
	{/if}
</svelte:head>
