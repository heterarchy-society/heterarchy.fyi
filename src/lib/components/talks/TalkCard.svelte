<script lang="ts">
	import { localizeUrl } from '$lib/i18n';
	import { talkThumbnailSrcset } from '$lib/data/talks';
	import type { Talk } from '$lib/data/talks';

	let { talk }: { talk: Talk } = $props();

	let thumbFailed = $state(false);

	const href = $derived(localizeUrl(`/talks/${talk.id}`));
	const src = $derived(!thumbFailed && talk.thumbnailUrl ? talk.thumbnailUrl : null);
	const srcset = $derived(!thumbFailed ? talkThumbnailSrcset(talk) : undefined);
</script>

<a {href} class="group flex flex-row gap-4 no-underline text-inherit">
	<div class="relative w-32 shrink-0 overflow-hidden border border-line bg-bg-muted transition-colors group-hover:border-black/40">
		{#if src}
			<img
				{src}
				{srcset}
				sizes="128px"
				alt={talk.title}
				width={128}
				height={72}
				class="aspect-video w-full object-cover"
				onerror={() => (thumbFailed = true)}
			/>
		{:else}
			<div class="aspect-video w-full bg-bg-muted"></div>
		{/if}
	</div>

	<div class="flex min-w-0 flex-1 flex-col justify-center">
		<p class="mb-1 font-mono text-[10px] text-black/50">{talk.date ?? ''}</p>
		<h2 class="font-mono text-[13px] leading-snug tracking-[-0.01em] wrap-break-word group-hover:underline">
			{talk.title}
		</h2>
	</div>
</a>
