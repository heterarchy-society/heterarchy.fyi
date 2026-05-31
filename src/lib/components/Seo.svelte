<script lang="ts">
	import { page } from '$app/state';
	import { getLocale } from '$lib/i18n';
	import { siteMeta } from '$lib/data/placeholder';
	import { absoluteSiteUrl } from '$lib/site';

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

	// search/hash are unavailable while prerendering (SvelteKit throws on access).
	const url = $derived(absoluteSiteUrl(page.url.pathname));
	const locale = $derived(getLocale());
	/** Generated /og/*.png cards are always 1200×630; other images must not use those dimensions. */
	const isGeneratedOgCard = $derived(Boolean(image?.includes('/og/')));
	const ogImageType = $derived(
		image?.endsWith('.png')
			? 'image/png'
			: image?.endsWith('.webp')
				? 'image/webp'
				: image?.endsWith('.jpg') || image?.endsWith('.jpeg')
					? 'image/jpeg'
					: null
	);
</script>

<svelte:head>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:site_name" content={siteMeta.title} />
	<meta property="og:locale" content={locale} />
	{#if image}
		<meta property="og:image" content={image} />
		{#if image.startsWith('https://')}
			<meta property="og:image:secure_url" content={image} />
		{/if}
		{#if ogImageType}
			<meta property="og:image:type" content={ogImageType} />
		{/if}
		{#if isGeneratedOgCard}
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
		{/if}
		<meta property="og:image:alt" content={title} />
	{/if}
	<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if image}
		<meta name="twitter:image" content={image} />
		<meta name="twitter:image:alt" content={title} />
	{/if}
</svelte:head>
