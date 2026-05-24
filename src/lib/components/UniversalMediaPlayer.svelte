<script lang="ts">
	import { goto } from '$app/navigation';
	import { Highlighter, Pause, Play, Volume2, VolumeX, X } from 'lucide-svelte';
	import { mediaPlayer } from '$lib/media/player.svelte';
	import { decodePeaks, drawWaveform as drawWaveformCanvas, hoverTimeFromPointer, seekTimeFromPointer } from '$lib/media/waveform';

	let audioEl: HTMLAudioElement | undefined = $state();
	let waveCanvas: HTMLCanvasElement | undefined = $state();
	let waveformHoverTime: number | null = $state(null);
	let raf: number | null = null;
	const speeds = [0.75, 1, 1.25, 1.5, 2];

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
			hoverTime: waveformHoverTime,
			inactiveColor: 'rgba(0,0,0,0.14)',
		});
	}

	function seekFromWaveform(e: MouseEvent) {
		if (!waveCanvas) return;
		mediaPlayer.seek(seekTimeFromPointer(e, waveCanvas, mediaPlayer.duration));
	}

	function previewWaveformSeek(e: PointerEvent) {
		if (!waveCanvas) return;
		waveformHoverTime = hoverTimeFromPointer(e, waveCanvas, mediaPlayer.duration);
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
	onloadedmetadata={() => { if (audioEl) mediaPlayer.duration = audioEl.duration; }}
	onended={() => { mediaPlayer.playing = false; stopTracking(); mediaPlayer.currentTime = 0; if (audioEl) audioEl.currentTime = 0; }}
></audio>

{#if mediaPlayer.track}
	<div class="media-player-shell fixed inset-x-0 bottom-0 z-50 px-4 py-3 backdrop-blur-md">
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
						{/if}
					</div>

					<div class="hidden shrink-0 items-center gap-2 sm:flex">
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

				{#if peaks}
					<canvas
						bind:this={waveCanvas}
						onclick={seekFromWaveform}
						onpointermove={previewWaveformSeek}
						onpointerleave={() => { waveformHoverTime = null; }}
						class="mt-1 h-9 w-full cursor-pointer"
						aria-label="Seek audio"
					></canvas>
				{:else}
					<button
						type="button"
						onclick={(e) => {
							mediaPlayer.seek(seekTimeFromPointer(e, e.currentTarget, mediaPlayer.duration));
						}}
						class="mt-2 h-3 w-full cursor-pointer py-1"
						aria-label="Seek audio"
					>
						<span class="block h-px w-full bg-black/15">
							<span class="block h-px bg-black/70" style={`width: ${progress * 100}%`}></span>
						</span>
					</button>
				{/if}
			</div>

			<span class="shrink-0 font-mono text-[11px] tabular-nums text-black/40">
				{formatTime(mediaPlayer.currentTime)}<span class="text-black/20"> / </span>{mediaPlayer.track.duration ?? formatTime(mediaPlayer.duration)}
			</span>

			<div class="flex shrink-0 items-center gap-1">
				<button
					type="button"
					onclick={() => mediaPlayer.clear()}
					class="flex h-8 w-8 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
					aria-label="Close audio player"
					title="Close audio player"
				>
					<X size={16} strokeWidth={1.8} />
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.media-player-shell {
		border-top: 1px solid rgba(0,0,0,0.13);
		background: rgba(252,252,250,0.78);
		box-shadow:
			0 -1px 0 rgba(255,255,255,0.45) inset,
			0 -14px 36px rgba(0,0,0,0.09);
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
</style>
