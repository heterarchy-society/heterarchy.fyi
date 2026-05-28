<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { Check, ChevronDown, ChevronUp, CornerUpLeft, Download, Highlighter, Link, Pause, PictureInPicture2, Play, Volume2, VolumeX, X } from 'lucide-svelte';
	import { mediaPlayer } from '$lib/media/player.svelte';
	import { decodePeaks, drawWaveform as drawWaveformCanvas, hoverTimeFromPointer, seekTimeFromPointer } from '$lib/media/waveform';
	import { loadYouTubeAPI } from '$lib/media/youtube';
	import * as m from '$lib/paraglide/messages';

	let mediaEl: HTMLVideoElement | undefined = $state();
	let videoDefaultEl: HTMLDivElement | undefined = $state();
	let ytDefaultEl: HTMLDivElement | undefined = $state();
	let miniVideoEl: HTMLDivElement | undefined = $state();
	let ytInstance: any = null;
	let ytCurrentVideoId: string | null = null;

	onMount(() => {
		if (videoDefaultEl) mediaPlayer.setVideoDefaultContainer(videoDefaultEl);
		if (ytDefaultEl) mediaPlayer.setYTDefaultContainer(ytDefaultEl);
	});

	$effect(() => {
		const videoId = mediaPlayer.track?.youtubeVideoId ?? null;
		if (!videoId || !ytDefaultEl) return;

		if (ytInstance) {
			if (!mediaPlayer.ytPlayerReady) {
				mediaPlayer.connectYouTubePlayer(ytInstance);
			}
			if (ytCurrentVideoId !== videoId) {
				ytCurrentVideoId = videoId;
				if (mediaPlayer.consumeYouTubePlayRequest()) {
					ytInstance.loadVideoById(videoId);
				} else {
					ytInstance.cueVideoById(videoId);
				}
			} else if (mediaPlayer.consumeYouTubePlayRequest()) {
				ytInstance.playVideo?.();
			}
			return;
		}

		loadYouTubeAPI().then(() => {
			if (!ytDefaultEl) return;
			const YT = (window as any).YT;
			const inner = document.createElement('div');
			ytDefaultEl.appendChild(inner);

			const player = new YT.Player(inner, {
				videoId,
				width: '100%',
				height: '100%',
				playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
				events: {
					onReady: () => {
						ytInstance = player;
						ytCurrentVideoId = videoId;
						mediaPlayer.connectYouTubePlayer(player);
						if (mediaPlayer.consumeYouTubePlayRequest()) {
							player.playVideo?.();
						}
					},
					onStateChange: (e: any) => {
						const S = YT.PlayerState;
						if (e.data === S.PLAYING) {
							mediaPlayer.playing = true;
							mediaPlayer.startYTSync();
						} else if (e.data === S.PAUSED || e.data === S.ENDED) {
							mediaPlayer.playing = false;
							mediaPlayer.stopYTSync();
						}
					},
				},
			});
		});
	});
	let waveCanvas: HTMLCanvasElement | undefined = $state();
	let waveformHoverTime: number | null = $state(null);
	let linearHoverTime: number | null = $state(null);
	let linearScrubbing = false;
	let raf: number | null = null;
	let showRemaining = $state(false);
	let timeCopied = $state(false);
	const speeds = [0.75, 1, 1.25, 1.5, 2];

	async function downloadAudio() {
		const src = mediaPlayer.track?.src;
		if (!src) return;
		const res = await fetch(src);
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = src.split('/').pop() ?? 'audio';
		a.click();
		URL.revokeObjectURL(url);
	}

	function copyTimestampLink() {
		const url = new URL(window.location.href);
		url.searchParams.set('t', String(Math.floor(mediaPlayer.currentTime)));
		navigator.clipboard.writeText(url.toString());
		timeCopied = true;
		setTimeout(() => { timeCopied = false; }, 1500);
	}

	function formatTime(s: number): string {
		if (!s || isNaN(s)) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function syncTime() {
		mediaPlayer.currentTime = mediaEl?.currentTime ?? 0;
		if (mediaPlayer.playing) raf = requestAnimationFrame(syncTime);
	}

	function startTracking() {
		if (raf !== null) return;
		syncTime();
	}

	function stopTracking() {
		if (raf !== null) cancelAnimationFrame(raf);
		raf = null;
		mediaPlayer.currentTime = mediaEl?.currentTime ?? mediaPlayer.currentTime;
	}

	const peaks = $derived(mediaPlayer.track?.peaks ? decodePeaks(mediaPlayer.track.peaks) : null);

	function drawWaveform() {
		if (!waveCanvas || !peaks) return;
		drawWaveformCanvas(waveCanvas, peaks, {
			currentTime: mediaPlayer.currentTime,
			duration: mediaPlayer.duration,
			bufferedTime: mediaPlayer.bufferedTime,
			hoverTime: waveformHoverTime,
		});
	}

	let scrubbing = false;

	function waveformPointerDown(e: PointerEvent) {
		if (!waveCanvas) return;
		scrubbing = true;
		waveCanvas.setPointerCapture(e.pointerId);
		mediaPlayer.seek(seekTimeFromPointer(e, waveCanvas, mediaPlayer.duration));
	}

	function waveformPointerMove(e: PointerEvent) {
		if (!waveCanvas) return;
		if (scrubbing) {
			mediaPlayer.seek(seekTimeFromPointer(e, waveCanvas, mediaPlayer.duration));
		}
		waveformHoverTime = hoverTimeFromPointer(e, waveCanvas, mediaPlayer.duration);
	}

	function waveformPointerUp() {
		scrubbing = false;
	}

	async function showHighlightedText() {
		const href = mediaPlayer.track?.href;
		mediaPlayer.requestTextFollow();
		if (href) await goto(href);
	}

	$effect(() => {
		if (!mediaEl) return;
		mediaPlayer.setMediaEl(mediaEl);

		const enterPiP = () => { mediaPlayer.pictureInPicture = true; };
		const leavePiP = () => { mediaPlayer.pictureInPicture = false; };
		mediaEl.addEventListener('enterpictureinpicture', enterPiP);
		mediaEl.addEventListener('leavepictureinpicture', leavePiP);

		return () => {
			mediaEl?.removeEventListener('enterpictureinpicture', enterPiP);
			mediaEl?.removeEventListener('leavepictureinpicture', leavePiP);
		};
	});

	$effect(() => {
		if (!mediaEl || !mediaPlayer.track?.src || mediaPlayer.track.youtubeVideoId) return;
		if (mediaEl.src !== mediaPlayer.track.src) {
			mediaEl.src = mediaPlayer.track.src;
		}
	});

	$effect(() => {
		return stopTracking;
	});

	$effect(() => {
		if (!waveCanvas || !peaks) return;
		drawWaveform();
		const ro = new ResizeObserver(drawWaveform);
		const redrawForTheme = () => requestAnimationFrame(drawWaveform);
		ro.observe(waveCanvas);
		window.addEventListener('heterarchy-themechange', redrawForTheme);
		return () => {
			ro.disconnect();
			window.removeEventListener('heterarchy-themechange', redrawForTheme);
		};
	});

	$effect(() => {
		void mediaPlayer.currentTime;
		void mediaPlayer.duration;
		void waveformHoverTime;
		void mediaPlayer.bufferedTime;
		void peaks;
		drawWaveform();
	});

	const progress = $derived(mediaPlayer.duration > 0 ? Math.min(1, mediaPlayer.currentTime / mediaPlayer.duration) : 0);
	const isOnTrackPage = $derived(mediaPlayer.track?.href ? isTrackPage(page.url.pathname, mediaPlayer.track.href) : false);
	const isVideoTrack = $derived(Boolean(mediaPlayer.track?.isVideo));
	const isNativeVideoTrack = $derived(Boolean(mediaPlayer.track?.isVideo && !mediaPlayer.track.youtubeVideoId));
	const showMiniPlayer = $derived(Boolean(mediaPlayer.track && !(mediaPlayer.track.isVideo && isOnTrackPage)));
	const showDetachedVideo = $derived(Boolean(
		mediaPlayer.minimized &&
		!isOnTrackPage &&
		isVideoTrack &&
		(mediaPlayer.track?.youtubeVideoId ? mediaPlayer.ytPlayerReady : mediaPlayer.mediaElReady) &&
		!mediaPlayer.pictureInPicture
	));
	const showMiniRowPlayback = $derived(!showDetachedVideo);

	function isTrackPage(pathname: string, href: string): boolean {
		const path = pathname.replace(/\/$/, '');
		const target = href.replace(/\/$/, '');
		return path === target || path.endsWith(target);
	}

	function restoreYouTubePlayback(time: number) {
		const player = mediaPlayer.ytPlayer;
		if (!player) return;

		const resume = () => {
			player.seekTo?.(Math.max(0, time), true);
			player.playVideo?.();
		};

		setTimeout(resume, 80);
		setTimeout(resume, 300);
	}

	$effect(() => {
		if (!showDetachedVideo || !miniVideoEl) return;

		const isYouTube = Boolean(mediaPlayer.track?.youtubeVideoId);
		const node = mediaPlayer.track?.youtubeVideoId
			? mediaPlayer.ytPlayer?.getIframe?.()
			: mediaPlayer.mediaEl;
		if (!node) return;

		const youTubeResume = isYouTube ? mediaPlayer.consumeYouTubePortalResume() : null;
		const shouldResumeYouTube = youTubeResume || (isYouTube && untrack(() => mediaPlayer.playing)
			? { time: untrack(() => mediaPlayer.currentTime) }
			: null);
		miniVideoEl.appendChild(node);
		if (shouldResumeYouTube) {
			restoreYouTubePlayback(shouldResumeYouTube.time);
		}

		return () => {
			const youTubeResumeOnCleanup = isYouTube ? mediaPlayer.consumeYouTubePortalResume() : null;
			const shouldResumeYouTubeOnCleanup = youTubeResumeOnCleanup || (isYouTube && untrack(() => mediaPlayer.playing)
				? { time: untrack(() => mediaPlayer.currentTime) }
				: null);
			const fallback = mediaPlayer.track?.youtubeVideoId
				? mediaPlayer.ytDefaultContainer
				: mediaPlayer.videoDefaultContainer;
			fallback?.appendChild(node);
			if (shouldResumeYouTubeOnCleanup) {
				restoreYouTubePlayback(shouldResumeYouTubeOnCleanup.time);
			}
		};
	});
</script>

<!-- Persistent video container — off-screen so the element survives navigation -->
<div bind:this={videoDefaultEl} style="position:fixed; width:1px; height:1px; top:0; left:-2px; overflow:hidden; pointer-events:none;" aria-hidden="true">
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={mediaEl}
		style="width:100%;height:100%;display:block;"
		onplay={() => { mediaPlayer.playing = true; startTracking(); }}
		onpause={() => { mediaPlayer.playing = false; stopTracking(); }}
		ontimeupdate={() => { mediaPlayer.currentTime = mediaEl?.currentTime ?? 0; }}
		onloadedmetadata={() => {
			if (!mediaEl) return;
			mediaPlayer.duration = mediaEl.duration;
			if (mediaPlayer.currentTime > 0) mediaEl.currentTime = mediaPlayer.currentTime;
		}}
		onprogress={() => { if (mediaEl?.buffered.length) mediaPlayer.bufferedTime = mediaEl.buffered.end(mediaEl.buffered.length - 1); }}
		onended={() => { stopTracking(); mediaPlayer.ended(); }}
	></video>
</div>

{#if showMiniPlayer && mediaPlayer.track}
	<div
		transition:fly={{ y: 80, duration: 220 }}
		class="mini-shell fixed inset-x-0 bottom-0 z-50 flex overflow-hidden sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[440px] sm:max-w-[calc(100vw-2.5rem)] sm:flex-col {showDetachedVideo ? 'flex-col' : 'flex-col-reverse'} {!mediaPlayer.minimized && !isVideoTrack ? 'sm:hidden' : ''}"
	>
		{#if showDetachedVideo}
			<div transition:fly={{ y: 28, duration: 260 }} class="mini-video-frame">
				<div bind:this={miniVideoEl} class="h-full w-full"></div>
				{#if mediaPlayer.track?.href}
					<a
						href={mediaPlayer.track.href}
						class="mini-video-return"
						aria-label="Return to video"
						title="Return to video"
					>
						<CornerUpLeft size={15} strokeWidth={1.9} />
					</a>
				{/if}
				<button
					type="button"
					onclick={() => mediaPlayer.clear()}
					class="mini-video-close"
					aria-label={m.audio_close_player()}
					title={m.audio_close_player()}
				>
					<X size={16} strokeWidth={1.9} />
				</button>
				<button
					type="button"
					onclick={() => mediaPlayer.toggle()}
					class="mini-video-toggle"
					aria-label={mediaPlayer.playing ? m.audio_pause() : m.audio_play()}
					title={mediaPlayer.playing ? m.audio_pause() : m.audio_play()}
				>
					{#if mediaPlayer.playing}
						<Pause size={22} fill="currentColor" strokeWidth={0} />
					{:else}
						<Play size={24} fill="currentColor" strokeWidth={0} style="transform: translateX(1px)" />
					{/if}
				</button>
			</div>
		{/if}

		<div class="flex items-center gap-2 px-4 py-3 sm:px-3 sm:py-2.5">
			{#if showMiniRowPlayback}
				<button
					type="button"
					onclick={() => mediaPlayer.toggle()}
					class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/20 text-black/70 transition-colors hover:border-black/50 hover:text-black sm:h-7 sm:w-7"
					aria-label={mediaPlayer.playing ? m.audio_pause() : m.audio_play()}
				>
					{#if mediaPlayer.playing}
						<Pause size={14} fill="currentColor" strokeWidth={0} class="sm:hidden" />
						<Pause size={12} fill="currentColor" strokeWidth={0} class="hidden sm:block" />
					{:else}
						<Play size={14} fill="currentColor" strokeWidth={0} style="transform: translateX(1px)" class="sm:hidden" />
						<Play size={12} fill="currentColor" strokeWidth={0} style="transform: translateX(1px)" class="hidden sm:block" />
					{/if}
				</button>
			{/if}

			{#if mediaPlayer.track.href}
				<a
					href={mediaPlayer.track.href}
					class="min-w-0 flex-1 text-left no-underline"
				>
					<span class="block truncate font-mono text-[12px] text-black/70 hover:text-black sm:text-[11px] sm:text-black/65">{mediaPlayer.track.title}</span>
					{#if mediaPlayer.track.subtitle}
						<span class="block font-mono text-[10px] text-black/35">{mediaPlayer.track.subtitle}</span>
					{/if}
				</a>
			{:else}
				<button
					type="button"
					onclick={() => { mediaPlayer.minimized = false; }}
					class="min-w-0 flex-1 cursor-pointer text-left"
					aria-label={m.audio_expand_player()}
				>
					<span class="block truncate font-mono text-[12px] text-black/70 hover:text-black sm:text-[11px] sm:text-black/65">{mediaPlayer.track.title}</span>
					{#if mediaPlayer.track.subtitle}
						<span class="block font-mono text-[10px] text-black/35 sm:hidden">{mediaPlayer.track.subtitle}</span>
					{/if}
				</button>
			{/if}

			<button
				type="button"
				onclick={() => { showRemaining = !showRemaining; }}
				class="shrink-0 cursor-pointer font-mono text-[11px] tabular-nums text-black/35 transition-colors hover:text-black/60 sm:text-[10px]"
				title={showRemaining ? m.audio_show_elapsed() : m.audio_show_remaining()}
			>
				{#if showRemaining}
					−{formatTime(Math.max(0, mediaPlayer.duration - mediaPlayer.currentTime))}
				{:else}
					{formatTime(mediaPlayer.currentTime)}
				{/if}
			</button>

			{#if isNativeVideoTrack}
				<button
					type="button"
					onclick={() => { void mediaPlayer.togglePictureInPicture(); }}
					class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition-colors sm:h-6 sm:w-6 {mediaPlayer.pictureInPicture ? 'text-black/70 hover:text-black' : 'text-black/25 hover:text-black/60'}"
					aria-label={mediaPlayer.pictureInPicture ? 'Exit picture-in-picture' : 'Enter picture-in-picture'}
					title={mediaPlayer.pictureInPicture ? 'Exit picture-in-picture' : 'Enter picture-in-picture'}
				>
					<PictureInPicture2 size={16} strokeWidth={1.8} class="sm:hidden" />
					<PictureInPicture2 size={14} strokeWidth={1.8} class="hidden sm:block" />
				</button>
			{/if}

			{#if !showDetachedVideo && !isVideoTrack}
				<button
					type="button"
					onclick={() => { mediaPlayer.minimized = false; }}
					class="hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-black/25 transition-colors hover:text-black/60 sm:flex sm:h-6 sm:w-6"
					aria-label={m.audio_expand_player()}
					title={m.audio_expand_player()}
				>
					<ChevronUp size={16} strokeWidth={1.8} class="sm:hidden" />
					<ChevronUp size={14} strokeWidth={1.8} class="hidden sm:block" />
				</button>
			{/if}

			<button
				type="button"
				onclick={() => mediaPlayer.clear()}
				class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55 sm:h-6 sm:w-6"
				aria-label={m.audio_close()}
				title={m.audio_close()}
			>
				<X size={16} strokeWidth={1.8} class="sm:hidden" />
				<X size={14} strokeWidth={1.8} class="hidden sm:block" />
			</button>
		</div>

		<div class="mini-seek-wrap">
			<input
				type="range"
				min="0"
				max={mediaPlayer.duration || 1}
				step="0.1"
				value={mediaPlayer.currentTime}
				oninput={(e) => mediaPlayer.seek(Number(e.currentTarget.value))}
				class="mini-seek-slider cursor-pointer"
				style="--pg: {progress * 100}%; --bf: {mediaPlayer.duration > 0 ? Math.min(100, mediaPlayer.bufferedTime / mediaPlayer.duration * 100) : 0}%"
				aria-label={m.audio_seek()}
			/>
		</div>
	</div>
{/if}

{#if mediaPlayer.track && !mediaPlayer.minimized && !isVideoTrack}
	<div transition:fly={{ y: 80, duration: 280 }} class="media-player-shell fixed inset-x-0 bottom-0 z-50 hidden px-4 py-3 backdrop-blur-md sm:block">
		<div class="mx-auto flex max-w-5xl items-center gap-4">
			<button
				type="button"
				onclick={() => mediaPlayer.toggle()}
				class="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/20 text-black/70 transition-colors hover:border-black/50 hover:text-black"
				aria-label={mediaPlayer.playing ? m.audio_pause() : m.audio_play()}
			>
				{#if mediaPlayer.playing}
					<Pause size={18} fill="currentColor" strokeWidth={0} />
				{:else}
					<Play size={18} fill="currentColor" strokeWidth={0} style="transform: translateX(1px)" />
				{/if}
			</button>

			<div class="min-w-0 flex-1">
				<div class="flex min-w-0 items-baseline justify-between gap-4">
					<div class="flex min-w-0 items-baseline gap-2">
						{#if mediaPlayer.track.href}
							<a href={mediaPlayer.track.href} class="truncate font-mono text-[12px] text-black/75 no-underline hover:text-black">
								{mediaPlayer.track.title}
							</a>
						{:else}
							<span class="truncate font-mono text-[12px] text-black/75">{mediaPlayer.track.title}</span>
						{/if}
						{#if mediaPlayer.track.subtitle}
							<span class="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-black/30 sm:inline">{mediaPlayer.track.subtitle}</span>
						{/if}
						{#if mediaPlayer.track.album}
							<span class="hidden text-black/15 sm:inline">·</span>
							<span class="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-black/20 sm:inline">{mediaPlayer.track.album}</span>
						{/if}
					</div>

					<div class="hidden shrink-0 items-center gap-2 sm:flex">
						{#if mediaPlayer.currentTime > 0}
							<button
								type="button"
								onclick={copyTimestampLink}
								title={timeCopied ? m.audio_copied() : m.audio_copy_timestamp()}
								class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center transition-colors {timeCopied ? 'text-black/60' : 'text-black/20 hover:text-black/55'}"
							>
								{#if timeCopied}
									<Check size={12} strokeWidth={2.2} />
								{:else}
									<Link size={12} strokeWidth={1.8} />
								{/if}
							</button>
						{/if}
						{#if mediaPlayer.track.followableText}
							<button
								type="button"
								onclick={showHighlightedText}
								class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
								aria-label={m.audio_show_highlighted_text()}
								title={m.audio_show_highlighted_text()}
							>
								<Highlighter size={14} strokeWidth={1.8} />
							</button>
							<span class="text-black/15">|</span>
						{/if}
						<span class="font-mono text-[10px] uppercase tracking-widest text-black/25">{m.audio_speed()}</span>
						{#each speeds as rate}
							<button
								type="button"
								onclick={() => mediaPlayer.setSpeed(rate)}
								class="cursor-pointer font-mono text-[10px] tabular-nums {mediaPlayer.speed === rate ? 'text-black' : 'text-black/30 hover:text-black/70'}"
							>{rate}x</button>
						{/each}
						<div class="ml-2 flex items-center gap-1.5">
							<button
								type="button"
								onclick={() => mediaPlayer.toggleMute()}
								class="flex h-6 w-6 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
								aria-label={mediaPlayer.volume > 0 ? m.audio_mute() : m.audio_unmute()}
								title={mediaPlayer.volume > 0 ? m.audio_mute() : m.audio_unmute()}
							>
								{#if mediaPlayer.volume > 0}
									<Volume2 size={14} strokeWidth={1.8} />
								{:else}
									<VolumeX size={14} strokeWidth={1.8} />
								{/if}
							</button>
							<input
								type="range"
								min="0"
								max="1"
								step="0.01"
								value={mediaPlayer.volume}
								oninput={(e) => mediaPlayer.setVolume(Number(e.currentTarget.value))}
								class="volume-slider h-6 w-16 cursor-pointer opacity-35 transition-opacity hover:opacity-65"
								aria-label={m.audio_volume()}
								title={m.audio_volume()}
							/>
						</div>
					</div>
				</div>

				<div class="mt-1 flex items-center gap-2">
					{#if peaks}
						<canvas
							bind:this={waveCanvas}
							onpointerdown={waveformPointerDown}
							onpointermove={waveformPointerMove}
							onpointerup={waveformPointerUp}
							onpointercancel={waveformPointerUp}
							onpointerleave={() => { if (!scrubbing) waveformHoverTime = null; }}
							class="h-9 min-w-0 flex-1 cursor-pointer"
							aria-label={m.audio_seek()}
						></canvas>
					{:else}
						<div
							role="slider"
							tabindex="0"
							aria-valuemin={0}
							aria-valuemax={mediaPlayer.duration}
							aria-valuenow={mediaPlayer.currentTime}
							aria-label={m.audio_seek()}
							class="relative flex h-9 min-w-0 flex-1 cursor-pointer items-center"
							onpointerdown={(e) => {
								linearScrubbing = true;
								e.currentTarget.setPointerCapture(e.pointerId);
								mediaPlayer.seek(seekTimeFromPointer(e, e.currentTarget, mediaPlayer.duration));
							}}
							onpointermove={(e) => {
								if (linearScrubbing) mediaPlayer.seek(seekTimeFromPointer(e, e.currentTarget, mediaPlayer.duration));
								linearHoverTime = hoverTimeFromPointer(e, e.currentTarget, mediaPlayer.duration);
							}}
							onpointerup={() => { linearScrubbing = false; }}
							onpointercancel={() => { linearScrubbing = false; }}
							onpointerleave={() => { if (!linearScrubbing) linearHoverTime = null; }}
						>
							<div class="relative h-px w-full">
								<div class="absolute inset-0 bg-black/10"></div>
								<div class="absolute inset-y-0 left-0 bg-black/55" style="width: {progress * 100}%"></div>
								<div class="absolute inset-y-0 bg-teal-600/20" style="left: {progress * 100}%; width: {Math.max(0, (mediaPlayer.duration > 0 ? mediaPlayer.bufferedTime / mediaPlayer.duration : 0) - progress) * 100}%"></div>
							</div>
							<div class="pointer-events-none absolute" style="left: {progress * 100}%; top: 50%; transform: translate(-50%, -50%); width: 2px; height: 14px; background: color-mix(in srgb, var(--theme-ink) 35%, transparent);"></div>
							{#if linearHoverTime !== null && mediaPlayer.duration > 0}
								<div class="pointer-events-none absolute inset-y-0 w-px bg-red-600/80" style="left: {linearHoverTime / mediaPlayer.duration * 100}%"></div>
							{/if}
						</div>
					{/if}
					<button
						type="button"
						onclick={() => { showRemaining = !showRemaining; }}
						title={showRemaining ? m.audio_show_elapsed() : m.audio_show_remaining()}
						class="shrink-0 cursor-pointer font-mono text-[11px] tabular-nums text-black/40 transition-colors hover:text-black/65"
					>
						{#if showRemaining}
							−{formatTime(Math.max(0, mediaPlayer.duration - mediaPlayer.currentTime))}<span class="text-black/20"> / </span>{mediaPlayer.track.duration ?? formatTime(mediaPlayer.duration)}
						{:else}
							{formatTime(mediaPlayer.currentTime)}<span class="text-black/20"> / </span>{mediaPlayer.track.duration ?? formatTime(mediaPlayer.duration)}
						{/if}
					</button>
					{#if !mediaPlayer.track?.youtubeVideoId}
						<button
							type="button"
							onclick={downloadAudio}
							class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
							aria-label={m.audio_download()}
							title={m.audio_download()}
						>
							<Download size={15} strokeWidth={1.8} />
						</button>
					{/if}
					<button
						type="button"
						onclick={() => { mediaPlayer.minimized = true; }}
						class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
						aria-label={m.audio_minimize_player()}
						title={m.audio_minimize_player()}
					>
						<ChevronDown size={16} strokeWidth={1.8} />
					</button>
					<button
						type="button"
						onclick={() => mediaPlayer.clear()}
						class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
						aria-label={m.audio_close_player()}
						title={m.audio_close_player()}
					>
						<X size={16} strokeWidth={1.8} />
					</button>
				</div>

				</div>
		</div>
	</div>
{/if}

<!-- Persistent YT container — off-screen but rendered so YouTube keeps playing -->
<div bind:this={ytDefaultEl} style="position:fixed; width:1px; height:1px; top:0; left:-2px; overflow:hidden; pointer-events:none;" aria-hidden="true"></div>

<style>
	.mini-shell {
		border-top: 1px solid var(--theme-player-border);
		background: var(--theme-player-bg);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	@media (min-width: 640px) {
		.mini-shell {
			border: 1px solid var(--theme-player-border);
			box-shadow:
				0 4px 24px var(--theme-player-shadow),
				0 1px 4px var(--theme-player-shadow);
		}
	}

	.mini-video-frame {
		position: relative;
		aspect-ratio: 16 / 9;
		width: 100%;
		overflow: hidden;
		border-bottom: 1px solid var(--theme-player-border);
		background: #000;
	}

	.mini-video-frame :global(video),
	.mini-video-frame :global(iframe) {
		display: block;
		width: 100%;
		height: 100%;
		background: #000;
		border: 0;
		object-fit: contain;
	}

	.mini-video-return,
	.mini-video-close,
	.mini-video-toggle {
		position: absolute;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.88);
		background: rgba(0, 0, 0, 0.42);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		opacity: 0;
		pointer-events: none;
		transition:
			color 160ms ease,
			background 160ms ease,
			opacity 160ms ease,
			transform 160ms ease;
	}

	.mini-video-frame:hover .mini-video-return,
	.mini-video-frame:hover .mini-video-close,
	.mini-video-frame:hover .mini-video-toggle,
	.mini-video-frame:focus-within .mini-video-return,
	.mini-video-frame:focus-within .mini-video-close,
	.mini-video-frame:focus-within .mini-video-toggle {
		opacity: 1;
		pointer-events: auto;
	}

	.mini-video-return,
	.mini-video-close {
		top: 10px;
		width: 34px;
		height: 34px;
	}

	.mini-video-return {
		left: 10px;
	}

	.mini-video-close {
		right: 10px;
	}

	.mini-video-toggle {
		top: 50%;
		left: 50%;
		width: 58px;
		height: 58px;
		border: 1px solid rgba(255, 255, 255, 0.24);
		border-radius: 999px;
		transform: translate(-50%, -50%);
	}

	.mini-video-return:hover,
	.mini-video-close:hover,
	.mini-video-toggle:hover {
		color: #fff;
		background: rgba(0, 0, 0, 0.62);
	}

	.mini-video-toggle:hover {
		transform: translate(-50%, -50%) scale(1.04);
	}

	.media-player-shell {
		border-top: 1px solid var(--theme-player-border);
		background: var(--theme-player-bg);
		box-shadow:
			0 -1px 0 color-mix(in srgb, var(--theme-ink) 12%, transparent) inset,
			0 -8px 24px var(--theme-player-shadow);
	}

	.volume-slider {
		appearance: none;
		background: transparent;
	}

	.volume-slider:focus {
		outline: none;
	}

	.volume-slider:focus-visible {
		outline: 1px solid var(--theme-focus);
		outline-offset: 3px;
	}

	.volume-slider::-webkit-slider-runnable-track {
		height: 2px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--theme-ink) 28%, transparent);
	}

	.volume-slider::-webkit-slider-thumb {
		appearance: none;
		width: 9px;
		height: 9px;
		margin-top: -3.5px;
		border: 0;
		border-radius: 999px;
		background: color-mix(in srgb, var(--theme-ink) 45%, transparent);
	}

	.volume-slider::-moz-range-track {
		height: 2px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--theme-ink) 28%, transparent);
	}

	.volume-slider::-moz-range-thumb {
		width: 9px;
		height: 9px;
		border: 0;
		border-radius: 999px;
		background: color-mix(in srgb, var(--theme-ink) 45%, transparent);
	}

	.mini-seek-wrap {
		overflow: hidden;
		height: 10px;
	}

	.mini-seek-slider {
		appearance: none;
		background: transparent;
		display: block;
		height: 10px;
		width: calc(100% + 8px);
		margin: 0 -4px;
		padding: 0;
	}

	.mini-seek-slider:focus {
		outline: none;
	}

	.mini-seek-slider::-webkit-slider-runnable-track {
		height: 2px;
		background: linear-gradient(
			to right,
			color-mix(in srgb, var(--theme-ink) 28%, transparent) var(--pg, 0%),
			var(--theme-accent) var(--pg, 0%),
			var(--theme-accent) var(--bf, 0%),
			color-mix(in srgb, var(--theme-ink) 5%, transparent) var(--bf, 0%)
		);
	}

	.mini-seek-slider::-webkit-slider-thumb {
		appearance: none;
		width: 2px;
		height: 12px;
		margin-top: -5px;
		border: 0;
		background: color-mix(in srgb, var(--theme-ink) 35%, transparent);
	}

	.mini-seek-slider:hover::-webkit-slider-thumb {
		width: 3px;
		background: color-mix(in srgb, var(--theme-ink) 55%, transparent);
	}

	.mini-seek-slider::-moz-range-track {
		height: 2px;
		background: color-mix(in srgb, var(--theme-ink) 10%, transparent);
	}

	.mini-seek-slider::-moz-range-progress {
		height: 2px;
		background: color-mix(in srgb, var(--theme-ink) 28%, transparent);
	}

	.mini-seek-slider::-moz-range-thumb {
		width: 2px;
		height: 12px;
		border: 0;
		border-radius: 0;
		background: color-mix(in srgb, var(--theme-ink) 35%, transparent);
	}

	.mini-seek-slider:hover::-moz-range-thumb {
		width: 3px;
		background: color-mix(in srgb, var(--theme-ink) 55%, transparent);
	}
</style>
