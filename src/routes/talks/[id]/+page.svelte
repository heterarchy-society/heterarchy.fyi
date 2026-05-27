<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { parseSpeaker, talkYoutubeEmbedUrl } from '$lib/data/talks';
	import { datasetConfigs } from '$lib/data/datasets';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const talksRepository = datasetConfigs.find((d) => d.id === 'talks')!.repository;

	const speakers = $derived(data.talk.speakers.map(parseSpeaker));
	const embedUrl = $derived(talkYoutubeEmbedUrl(data.talk));

	function descriptionParagraphs(text: string): string[] {
		return text.split(/\n\n+/).filter(Boolean);
	}
</script>

<svelte:head>
	<title>{data.talk.title} — The Heterarchy Society</title>
	<meta name="description" content={data.talk.description?.split(/\n\n+/)[0] ?? ''} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy border-b border-line">
			<a href={localizeUrl('/talks')} class="link-arrow mb-8 inline-block text-[12px]">{m.talks_detail_back()}</a>

			<p class="label mb-2">{m.talks_detail_label()}</p>

			<h1 class="mb-4 font-mono text-[22px] leading-tight tracking-[-0.01em] sm:text-[28px]">
				{data.talk.title}
			</h1>

			<p class="mb-6 font-mono text-[12px] text-black/45">
				{data.talk.date}
				{#if speakers.length > 0}
					·
					{#each speakers as speaker, i}
						{#if speaker.personId}
							<a href={localizeUrl(`/people/${speaker.personId}`)} class="text-black/55 no-underline hover:underline">{speaker.name}</a>
						{:else}
							<span>{speaker.name}</span>
						{/if}{#if i < speakers.length - 1}, {/if}
					{/each}
				{/if}
				{#if data.talk.video?.duration}
					· {data.talk.video.duration}
				{/if}
			</p>

			{#if embedUrl}
				<div class="mb-8 w-full max-w-3xl">
					<div class="relative aspect-video w-full bg-black">
						<iframe
							src={embedUrl}
							title={data.talk.title}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
							class="absolute inset-0 h-full w-full border-0"
							loading="lazy"
						></iframe>
					</div>
					<a
						href={data.talk.video.url}
						target="_blank"
						rel="noopener noreferrer"
						class="link-external mt-2 inline-block font-mono text-[11px] text-black/40"
					>{m.talks_detail_watch()}</a>
				</div>
			{/if}

			{#if data.talk.description}
				<div class="max-w-2xl space-y-4">
					{#each descriptionParagraphs(data.talk.description) as para}
						<p class="text-[15px] leading-[1.7] text-black/75">{para}</p>
					{/each}
				</div>
			{/if}
		</section>

		<section class="cell-roomy border-b border-line">
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#if speakers.length > 0}
					<div>
						<p class="label mb-3">{m.talks_detail_speakers()}</p>
						<ul class="space-y-1">
							{#each speakers as speaker}
								<li class="font-mono text-[13px]">
									{#if speaker.personId}
										<a href={localizeUrl(`/people/${speaker.personId}`)} class="text-black no-underline hover:underline">{speaker.name}</a>
									{:else}
										<span>{speaker.name}</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if data.collection}
					<div>
						<p class="label mb-3">{m.talks_detail_collection()}</p>
						<p class="font-mono text-[13px]">{data.collection.title}</p>
						{#if data.collection.count}
							<p class="mt-1 font-mono text-[11px] text-black/40">{m.talks_count({ count: String(data.collection.count) })}</p>
						{/if}
					</div>
				{/if}

				<div>
					<p class="label mb-3">Dataset</p>
					<a
						href={talksRepository}
						target="_blank"
						rel="noopener noreferrer"
						class="link-external font-mono text-[13px]"
					>git</a>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
