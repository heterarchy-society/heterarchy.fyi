<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LatestRevision from '$lib/components/LatestRevision.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { talkThumbnailUrl, talkThumbnailSrcset, parseSpeaker } from '$lib/data/talks';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const PAGE_SIZE = 20;
	const totalCount = $derived(data.talks.length);
	let visibleCount = $state(PAGE_SIZE);
	let sentinel = $state<HTMLElement | null>(null);

	const visibleTalks = $derived(data.talks.slice(0, visibleCount));
	const hasMore = $derived(visibleCount < totalCount);

	$effect(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					visibleCount = Math.min(visibleCount + PAGE_SIZE, totalCount);
				}
			},
			{ rootMargin: '600px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	function speakerNames(speakers: string[]): string {
		return speakers.map((s) => parseSpeaker(s).name).join(', ');
	}
</script>

<svelte:head>
	<title>{m.talks_page_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.talks_page_lead()} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy border-b border-line">
			<div class="mb-4 flex items-start justify-between gap-4 lg:mb-0">
				<p class="label">{m.talks_page_label()}</p>
				{#if data.latestRevision}
					<LatestRevision latest={data.latestRevision} changelogHref={localizeUrl('/talks/changelog')} />
				{/if}
			</div>
			<h1 class="page-lead mb-4">{m.talks_page_title()}</h1>
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.talks_page_lead()}</p>
		</section>

		{#if data.talks.length > 0}
			<section>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
					{#each visibleTalks as talk (talk.id)}
						<a
							href={localizeUrl(`/talks/${talk.id}`)}
							class="group block border-b border-r border-line p-6 no-underline lg:p-8"
						>
							<article>
								{#if talkThumbnailUrl(talk)}
									<div class="relative mb-5 aspect-video w-full overflow-hidden border border-line bg-bg-muted">
										<img
											src={talkThumbnailUrl(talk)!}
											srcset={talkThumbnailSrcset(talk)}
											sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
											alt={talk.title}
											class="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-85"
											loading="lazy"
											decoding="async"
										/>
										{#if talk.video?.duration}
											<span class="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
												{talk.video.duration}
											</span>
										{/if}
									</div>
								{:else}
									<div class="mb-5 aspect-video w-full border border-line bg-bg-muted" aria-hidden="true"></div>
								{/if}

								<h2 class="mb-2 font-mono text-[15px] leading-snug text-black underline decoration-transparent underline-offset-[3px] transition-colors group-hover:decoration-current">
									{talk.title}
								</h2>

								<p class="font-mono text-[10px] uppercase tracking-widest text-black/35">
									{talk.date}
									{#if talk.speakers?.length}
										· {speakerNames(talk.speakers)}
									{/if}
								</p>
							</article>
						</a>
					{/each}
				</div>
				{#if hasMore}
					<div bind:this={sentinel} class="h-1" aria-hidden="true"></div>
				{/if}
				<p class="px-8 py-6 font-mono text-[11px] text-black/35 lg:px-10">
					{m.talks_count({ count: String(data.talks.length) })}
				</p>
			</section>
		{/if}

		<section class="cell-roomy">
			<p class="max-w-xl text-[15px] leading-[1.65] text-black/75">{m.talks_contribute_text()}</p>
			<div class="mt-6 flex flex-wrap gap-x-8 gap-y-3">
				<a href={localizeUrl('/find-us')} class="link-arrow text-[13px]">{m.talks_contribute_where()}</a>
			</div>
		</section>
	</main>

	<Footer />
</div>
