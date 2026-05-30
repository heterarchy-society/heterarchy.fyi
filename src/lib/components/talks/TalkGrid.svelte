<script lang="ts">
	import { localizeUrl } from '$lib/i18n';
	import { talkThumbnailUrl, talkThumbnailSrcset, parseSpeaker } from '$lib/data/talks';
	import type { Talk } from '$lib/data/talks';

	let { talks, borderTop = true }: { talks: Talk[]; borderTop?: boolean } = $props();

	function speakerNames(speakers: string[]): string {
		return speakers.map((s) => parseSpeaker(s).name).join(', ');
	}
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 border-l border-line" class:border-t={borderTop}>
	{#each talks as talk (talk.id)}
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
