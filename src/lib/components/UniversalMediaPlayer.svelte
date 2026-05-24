<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { Check, ChevronDown, ChevronUp, Download, Highlighter, Link, Pause, Play, Volume2, VolumeX, X } from 'lucide-svelte';
	import { mediaPlayer } from '$lib/media/player.svelte';
	import { decodePeaks, drawWaveform as drawWaveformCanvas, hoverTimeFromPointer, seekTimeFromPointer } from '$lib/media/waveform';

	let audioEl: HTMLAudioElement | undefined = $state();
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
		mediaPlayer.currentTime = audioEl?.currentTime ?? 0;
		if (mediaPlayer.playing) raf = requestAnimationFrame(syncTime);
	}

	function startTracking() {
		if (raf !== null) return;
		syncTime();
	}

	function stopTracking() {
		if (raf !== null) cancelAnimationFrame(raf);
		raf = null;
		mediaPlayer.currentTime = audioEl?.currentTime ?? mediaPlayer.currentTime;
	}

	const peaks = $derived(mediaPlayer.track?.peaks ? decodePeaks(mediaPlayer.track.peaks) : null);

	function drawWaveform() {
		if (!waveCanvas || !peaks) return;
		drawWaveformCanvas(waveCanvas, peaks, {
			currentTime: mediaPlayer.currentTime,
			duration: mediaPlayer.duration,
			bufferedTime: mediaPlayer.bufferedTime,
			hoverTime: waveformHoverTime,
			inactiveColor: 'rgba(0,0,0,0.14)',
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
		if (!audioEl) return;
		mediaPlayer.setAudio(audioEl);
	});

	$effect(() => {
		if (!audioEl || !mediaPlayer.track) return;
		if (audioEl.src !== mediaPlayer.track.src) {
			audioEl.src = mediaPlayer.track.src;
		}
	});

	$effect(() => {
		return stopTracking;
	});

	$effect(() => {
		if (!waveCanvas || !peaks) return;
		drawWaveform();
		const ro = new ResizeObserver(drawWaveform);
		ro.observe(waveCanvas);
		return () => ro.disconnect();
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
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<audio
	bind:this={audioEl}
	onplay={() => { mediaPlayer.playing = true; startTracking(); }}
	onpause={() => { mediaPlayer.playing = false; stopTracking(); }}
	ontimeupdate={() => { mediaPlayer.currentTime = audioEl?.currentTime ?? 0; }}
	onloadedmetadata={() => {
		if (!audioEl) return;
		mediaPlayer.duration = audioEl.duration;
		if (mediaPlayer.currentTime > 0) audioEl.currentTime = mediaPlayer.currentTime;
	}}
	onprogress={() => { if (audioEl?.buffered.length) mediaPlayer.bufferedTime = audioEl.buffered.end(audioEl.buffered.length - 1); }}
	onended={() => { mediaPlayer.playing = false; stopTracking(); mediaPlayer.currentTime = 0; if (audioEl) audioEl.currentTime = 0; mediaPlayer.clear(); }}
></audio>

{#if mediaPlayer.track && mediaPlayer.minimized}
	<div
		transition:fly={{ y: 16, x: 16, duration: 220 }}
		class="mini-shell fixed bottom-5 right-5 z-50 overflow-hidden"
	>
		<div class="flex items-center gap-2 px-3 py-2.5">
			<button
				type="button"
				onclick={() => mediaPlayer.toggle()}
				class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/20 text-black/70 transition-colors hover:border-black/50 hover:text-black"
				aria-label={mediaPlayer.playing ? 'Pause' : 'Play'}
			>
				{#if mediaPlayer.playing}
					<Pause size={12} fill="currentColor" strokeWidth={0} />
				{:else}
					<Play size={12} fill="currentColor" strokeWidth={0} style="transform: translateX(1px)" />
				{/if}
			</button>

			<button
				type="button"
				onclick={() => { mediaPlayer.minimized = false; }}
				class="min-w-0 flex-1 cursor-pointer text-left"
				aria-label="Expand player"
			>
				<span class="block truncate font-mono text-[11px] text-black/65 hover:text-black">{mediaPlayer.track.title}</span>
			</button>

			<button
				type="button"
				onclick={() => { showRemaining = !showRemaining; }}
				class="shrink-0 cursor-pointer font-mono text-[10px] tabular-nums text-black/35 transition-colors hover:text-black/60"
				title={showRemaining ? 'Show elapsed time' : 'Show remaining time'}
			>
				{#if showRemaining}
					−{formatTime(Math.max(0, mediaPlayer.duration - mediaPlayer.currentTime))}
				{:else}
					{formatTime(mediaPlayer.currentTime)}
				{/if}
			</button>

			<button
				type="button"
				onclick={() => { mediaPlayer.minimized = false; }}
				class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-black/25 transition-colors hover:text-black/60"
				aria-label="Expand player"
				title="Expand player"
			>
				<ChevronUp size={14} strokeWidth={1.8} />
			</button>

			<button
				type="button"
				onclick={() => mediaPlayer.clear()}
				class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
				aria-label="Close"
				title="Close"
			>
				<X size={14} strokeWidth={1.8} />
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
				aria-label="Seek"
			/>
		</div>
	</div>
{/if}

{#if mediaPlayer.track && !mediaPlayer.minimized}
	<div transition:fly={{ y: 80, duration: 280 }} class="media-player-shell fixed inset-x-0 bottom-0 z-50 px-4 py-3 backdrop-blur-md">
		<div class="mx-auto flex max-w-5xl items-center gap-4">
			<button
				type="button"
				onclick={() => mediaPlayer.toggle()}
				class="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/20 text-black/70 transition-colors hover:border-black/50 hover:text-black"
				aria-label={mediaPlayer.playing ? 'Pause' : 'Play'}
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
					</div>

					<div class="hidden shrink-0 items-center gap-2 sm:flex">
						{#if mediaPlayer.currentTime > 0}
							<button
								type="button"
								onclick={copyTimestampLink}
								title={timeCopied ? 'Copied!' : 'Copy link at current time'}
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
								aria-label="Show highlighted text"
								title="Show highlighted text"
							>
								<Highlighter size={14} strokeWidth={1.8} />
							</button>
							<span class="text-black/15">|</span>
						{/if}
						<span class="font-mono text-[10px] uppercase tracking-widest text-black/25">speed</span>
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
								aria-label={mediaPlayer.volume > 0 ? 'Mute audio' : 'Unmute audio'}
								title={mediaPlayer.volume > 0 ? 'Mute audio' : 'Unmute audio'}
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
								aria-label="Volume"
								title="Volume"
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
							aria-label="Seek audio"
						></canvas>
					{:else}
						<div
							role="slider"
							tabindex="0"
							aria-valuemin={0}
							aria-valuemax={mediaPlayer.duration}
							aria-valuenow={mediaPlayer.currentTime}
							aria-label="Seek audio"
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
								<div class="absolute inset-y-0 bg-teal-600/30" style="left: {progress * 100}%; width: {Math.max(0, (mediaPlayer.duration > 0 ? mediaPlayer.bufferedTime / mediaPlayer.duration : 0) - progress) * 100}%"></div>
							</div>
							<div class="pointer-events-none absolute" style="left: {progress * 100}%; top: 50%; transform: translate(-50%, -50%); width: 2px; height: 14px; background: rgba(0,0,0,0.35);"></div>
							{#if linearHoverTime !== null && mediaPlayer.duration > 0}
								<div class="pointer-events-none absolute inset-y-0 w-px bg-red-600/80" style="left: {linearHoverTime / mediaPlayer.duration * 100}%"></div>
							{/if}
						</div>
					{/if}
					<button
						type="button"
						onclick={() => { showRemaining = !showRemaining; }}
						title={showRemaining ? 'Show elapsed time' : 'Show remaining time'}
						class="shrink-0 cursor-pointer font-mono text-[11px] tabular-nums text-black/40 transition-colors hover:text-black/65"
					>
						{#if showRemaining}
							−{formatTime(Math.max(0, mediaPlayer.duration - mediaPlayer.currentTime))}<span class="text-black/20"> / </span>{mediaPlayer.track.duration ?? formatTime(mediaPlayer.duration)}
						{:else}
							{formatTime(mediaPlayer.currentTime)}<span class="text-black/20"> / </span>{mediaPlayer.track.duration ?? formatTime(mediaPlayer.duration)}
						{/if}
					</button>
					<button
						type="button"
						onclick={downloadAudio}
						class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
						aria-label="Download audio"
						title="Download audio"
					>
						<Download size={15} strokeWidth={1.8} />
					</button>
					<button
						type="button"
						onclick={() => { mediaPlayer.minimized = true; }}
						class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
						aria-label="Minimize player"
						title="Minimize player"
					>
						<ChevronDown size={16} strokeWidth={1.8} />
					</button>
					<button
						type="button"
						onclick={() => mediaPlayer.clear()}
						class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
						aria-label="Close audio player"
						title="Close audio player"
					>
						<X size={16} strokeWidth={1.8} />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.mini-shell {
		border: 1px solid rgba(0,0,0,0.10);
		background: rgba(252,252,250,0.90);
		box-shadow:
			0 4px 24px rgba(0,0,0,0.10),
			0 1px 4px rgba(0,0,0,0.06);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.media-player-shell {
		border-top: 1px solid rgba(0,0,0,0.13);
		background: rgba(252,252,250,0.78);
		box-shadow:
			0 -1px 0 rgba(255,255,255,0.35) inset,
			0 -8px 24px rgba(0,0,0,0.05);
	}

	.volume-slider {
		appearance: none;
		background: transparent;
	}

	.volume-slider:focus {
		outline: none;
	}

	.volume-slider:focus-visible {
		outline: 1px solid rgba(0,0,0,0.18);
		outline-offset: 3px;
	}

	.volume-slider::-webkit-slider-runnable-track {
		height: 2px;
		border-radius: 999px;
		background: rgba(0,0,0,0.28);
	}

	.volume-slider::-webkit-slider-thumb {
		appearance: none;
		width: 9px;
		height: 9px;
		margin-top: -3.5px;
		border: 0;
		border-radius: 999px;
		background: rgba(0,0,0,0.45);
	}

	.volume-slider::-moz-range-track {
		height: 2px;
		border-radius: 999px;
		background: rgba(0,0,0,0.28);
	}

	.volume-slider::-moz-range-thumb {
		width: 9px;
		height: 9px;
		border: 0;
		border-radius: 999px;
		background: rgba(0,0,0,0.45);
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
			rgba(0,0,0,0.28) var(--pg, 0%),
			rgba(15,118,110,0.22) var(--pg, 0%),
			rgba(15,118,110,0.22) var(--bf, 0%),
			rgba(0,0,0,0.05) var(--bf, 0%)
		);
	}

	.mini-seek-slider::-webkit-slider-thumb {
		appearance: none;
		width: 2px;
		height: 12px;
		margin-top: -5px;
		border: 0;
		background: rgba(0,0,0,0.35);
	}

	.mini-seek-slider:hover::-webkit-slider-thumb {
		width: 3px;
		background: rgba(0,0,0,0.55);
	}

	.mini-seek-slider::-moz-range-track {
		height: 2px;
		background: rgba(0,0,0,0.10);
	}

	.mini-seek-slider::-moz-range-progress {
		height: 2px;
		background: rgba(0,0,0,0.28);
	}

	.mini-seek-slider::-moz-range-thumb {
		width: 2px;
		height: 12px;
		border: 0;
		border-radius: 0;
		background: rgba(0,0,0,0.35);
	}

	.mini-seek-slider:hover::-moz-range-thumb {
		width: 3px;
		background: rgba(0,0,0,0.55);
	}
</style>
