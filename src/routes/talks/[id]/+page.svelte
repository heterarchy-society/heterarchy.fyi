<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { localizeUrl, getLocale } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import { untrack } from 'svelte';
	import { parseSpeaker, talkThumbnailUrl, talkThumbnailSrcset } from '$lib/data/talks';
	import { mediaPlayer } from '$lib/media/player.svelte';
	import { peopleById, personAvatarUrl, imageSrcset } from '$lib/data/people';
	import { datasetConfigs } from '$lib/data/datasets';
	import { ExternalLink, User, Play } from 'lucide-svelte';
	import VideoPlayer from '$lib/components/talks/VideoPlayer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const talksRepository = datasetConfigs.find((d) => d.id === 'talks')!.repository;

	const speakers = $derived((data.talk.speakers ?? []).map(parseSpeaker));

	$effect(() => {
		if (!data.talk.archiveSrc || !data.talk.video?.videoId) return;

		const track = {
			id: data.talk.id,
			title: data.talk.title,
			subtitle: (data.talk.speakers ?? []).map((s) => parseSpeaker(s).name).join(', ') || undefined,
			href: `/talks/${data.talk.id}`,
			duration: data.talk.video.duration,
			src: data.talk.archiveSrc,
			durationSeconds: data.talk.archiveDuration,
			isVideo: true,
		};

		untrack(() => {
			if (!mediaPlayer.playing) {
				void mediaPlayer.play(track).catch(() => {});
			}
		});
	});

	const isThisTalkActive = $derived(mediaPlayer.track?.id === data.talk.id);

	let ytPlaying = $state(false);
	$effect(() => {
		data.talk.id;
		const isYouTube = !data.talk.archiveSrc && !!data.talk.video?.videoId;
		ytPlaying = isYouTube && untrack(() => !mediaPlayer.playing);
	});

	function playYouTube() {
		mediaPlayer.clear();
		ytPlaying = true;
	}

	function playTalk() {
		if (!data.talk.archiveSrc || !data.talk.video?.videoId) return;
		void mediaPlayer.play({
			id: data.talk.id,
			title: data.talk.title,
			subtitle: speakers.map((s) => s.name).join(', ') || undefined,
			href: `/talks/${data.talk.id}`,
			duration: data.talk.video.duration,
			src: data.talk.archiveSrc,
			durationSeconds: data.talk.archiveDuration,
			isVideo: true,
		}).catch(() => {});
	}

	const SPEAKERS_PREVIEW = 3;
	let showAllSpeakers = $state(false);
	const visibleSpeakers = $derived(showAllSpeakers ? speakers : speakers.slice(0, SPEAKERS_PREVIEW));

	function formatDate(date: string): string {
		return new Date(date).toLocaleDateString(getLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
	}

	// Converts a colon-separated duration ("40:31", "1:22:01") to "40m31s" / "1h22m01s".
	function formatDuration(duration: string): string {
		const parts = duration.split(':').map((p) => parseInt(p, 10));
		if (parts.some(Number.isNaN)) return duration;
		const [h, m, s] = parts.length === 3 ? parts : [0, ...parts];
		const out = [];
		if (h) out.push(`${h}h`);
		if (h || m) out.push(`${h ? String(m).padStart(2, '0') : m}m`);
		out.push(`${h || m ? String(s).padStart(2, '0') : s}s`);
		return out.join('');
	}

</script>

<svelte:head>
	<title>{data.talk.title} — The Heterarchy Society</title>
	<meta name="description" content={data.talk.description?.split(/\n\n+/)[0] ?? ''} />
</svelte:head>

<Seo
	title="{data.talk.title} — The Heterarchy Society"
	description={data.talk.description?.split(/\n\n+/)[0] ?? ''}
	image={talkThumbnailUrl(data.talk)}
/>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<!-- Title + meta -->
		<section class="px-8 pt-8 pb-0 lg:px-10 lg:pt-10">
			<p class="label mb-4 flex items-baseline gap-[0.5em]">
				<a href={localizeUrl('/talks')} class="no-underline hover:underline">{m.talks_detail_label()}</a>
				{#if data.talk.source}
					<span class="text-black/30">/</span>
					<span>{data.talk.source.toUpperCase()}</span>
				{/if}
				{#if data.collection}
					<span class="text-black/30">/</span>
					<span>{data.collection.title}</span>
				{/if}
			</p>

			<h1 class="mb-4 font-mono text-[20px] leading-tight tracking-[-0.01em] sm:text-[26px]">
				{data.talk.title}
			</h1>

			<div class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[13px] text-black/55">
				{#each visibleSpeakers as speaker}
					{@const person = speaker.personId ? peopleById.get(speaker.personId) : null}
					{@const avatarUrl = person ? personAvatarUrl(person) : null}
					{#if speaker.personId}
						<a href={localizeUrl(`/people/${speaker.personId}`)} class="group inline-flex items-center gap-2 text-inherit no-underline hover:text-black">
							{#if avatarUrl}
								<img
									src={avatarUrl}
									srcset={imageSrcset(person!.avatarVersions)}
									sizes="32px"
									alt={speaker.name}
									width={32} height={32}
									class="size-8 border border-line object-cover"
								/>
							{:else}
								<span class="inline-flex size-8 shrink-0 items-center justify-center border border-line bg-black/5">
									<User size={14} strokeWidth={1.5} class="text-black/40" />
								</span>
							{/if}
							<span class="group-hover:underline">{speaker.name}</span>
						</a>
					{:else}
						<span class="inline-flex items-center gap-2">
							<span class="inline-flex size-8 shrink-0 items-center justify-center border border-line bg-black/5">
								<User size={14} strokeWidth={1.5} class="text-black/40" />
							</span>
							{speaker.name}
						</span>
					{/if}
				{/each}
				{#if !showAllSpeakers && speakers.length > SPEAKERS_PREVIEW}
					<button
						onclick={() => showAllSpeakers = true}
						class="font-mono text-[11px] text-black/40 hover:text-black/70"
					>+{speakers.length - SPEAKERS_PREVIEW} more</button>
				{/if}
				{#if data.talk.date}
					{#if speakers.length > 0}<span class="text-black/35">·</span>{/if}
					<span>{formatDate(data.talk.date)}</span>
				{/if}
				{#if data.talk.video?.duration}
					<span class="text-black/35">·</span>
					<span class="text-black/40">{formatDuration(data.talk.video.duration)}</span>
				{/if}
			</div>

		</section>

		{#if data.talk.video?.videoId}
			<div class="px-4 py-4 lg:px-6 lg:py-5">
				<div class="relative aspect-video w-full overflow-hidden bg-bg-muted">
					{#if data.talk.archiveSrc}
						{#if isThisTalkActive}
							<VideoPlayer />
						{:else}
							{#if talkThumbnailUrl(data.talk)}
								<img
									src={talkThumbnailUrl(data.talk)!}
									srcset={talkThumbnailSrcset(data.talk)}
									sizes="100vw"
									alt=""
									aria-hidden="true"
									class="absolute inset-0 h-full w-full object-cover"
								/>
							{/if}
							<button
								onclick={playTalk}
								class="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
								aria-label="Play"
							>
								<span class="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:shadow-xl">
									<Play size={28} class="translate-x-0.5 text-black" />
								</span>
							</button>
						{/if}
					{:else if data.talk.video?.videoId}
						{#if ytPlaying}
							<iframe
								src="https://www.youtube-nocookie.com/embed/{data.talk.video.videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1"
								title={data.talk.title}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
								class="absolute inset-0 h-full w-full border-0"
							></iframe>
						{:else}
							{#if talkThumbnailUrl(data.talk)}
								<img
									src={talkThumbnailUrl(data.talk)!}
									srcset={talkThumbnailSrcset(data.talk)}
									sizes="100vw"
									alt=""
									aria-hidden="true"
									class="absolute inset-0 h-full w-full object-cover"
								/>
							{/if}
							<button
								onclick={playYouTube}
								class="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
								aria-label="Play"
							>
								<span class="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:shadow-xl">
									<Play size={28} class="translate-x-0.5 text-black" />
								</span>
							</button>
						{/if}
					{/if}
				</div>
			</div>
		{/if}

		<!-- 2-col: description + sidebar -->
		<div class="grid lg:grid-cols-[1fr_minmax(300px,380px)]">
			<section class="border-b border-line px-8 py-7 lg:px-10 lg:py-8">
				{#if data.descriptionHtml}
					<div class="max-w-2xl text-[15px] leading-[1.7] text-black/75
						[&_p]:mb-4 [&_p:last-child]:mb-0
						[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-line [&_a:hover]:decoration-black/60
						[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5
						[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5
						[&_li]:mb-1
						[&_strong]:font-semibold
						[&_em]:italic">
						{@html data.descriptionHtml}
					</div>
				{/if}
			</section>

			<aside class="cell-right">
				{#if data.talk.video}
					<div class="mb-8">
						<a
							href={data.talk.video.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 font-mono text-[13px] no-underline hover:underline"
						>
							<ExternalLink size={13} strokeWidth={1.5} class="shrink-0 text-black/40" />
							{m.talks_detail_watch()}
						</a>
						{#if data.talk.video.videoId}
							<p class="mt-2 font-mono text-[11px] text-black/35">ID: {data.talk.video.videoId}</p>
						{/if}
					</div>
				{/if}

				{#if speakers.length > 0}
					<div class="mb-8">
						<p class="label mb-3">{m.talks_detail_speakers()}</p>
						<ul class="space-y-2">
							{#each speakers as speaker}
								{@const person = speaker.personId ? peopleById.get(speaker.personId) : null}
								{@const avatarUrl = person ? personAvatarUrl(person) : null}
								<li>
									{#if speaker.personId}
										<a href={localizeUrl(`/people/${speaker.personId}`)} class="group inline-flex items-center gap-2 no-underline hover:text-black">
											{#if avatarUrl}
												<img
													src={avatarUrl}
													srcset={imageSrcset(person!.avatarVersions)}
													sizes="32px"
													alt={speaker.name}
													width={32} height={32}
													class="size-8 border border-line object-cover"
												/>
											{:else}
												<span class="inline-flex size-8 shrink-0 items-center justify-center border border-line bg-black/5">
													<User size={14} strokeWidth={1.5} class="text-black/40" />
												</span>
											{/if}
											<span class="font-mono text-[13px] group-hover:underline">{speaker.name}</span>
										</a>
									{:else}
										<span class="inline-flex items-center gap-2">
											<span class="inline-flex size-8 shrink-0 items-center justify-center border border-line bg-black/5">
												<User size={14} strokeWidth={1.5} class="text-black/40" />
											</span>
											<span class="font-mono text-[13px]">{speaker.name}</span>
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

	<div class="mb-8">
					<p class="label mb-3">{data.talk.date}</p>
					{#if data.talk.language}
						<p class="font-mono text-[11px] uppercase tracking-widest text-black/40">{data.talk.language}</p>
					{/if}
				</div>

				<a
					href={talksRepository}
					target="_blank"
					rel="noopener noreferrer"
					class="link-external font-mono text-[11px] text-black/35"
				>git</a>
			</aside>
		</div>
	</main>

	<Footer />
</div>
