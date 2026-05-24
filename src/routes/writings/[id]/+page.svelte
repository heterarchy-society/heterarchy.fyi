<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { getLocale, localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import { tick } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Captions, Highlighter, RotateCcw, X } from 'lucide-svelte';
	import { mediaPlayer, type MediaTrack } from '$lib/media/player.svelte';
	import { decodePeaks, drawWaveform as drawWaveformCanvas, hoverTimeFromPointer, seekTimeFromPointer } from '$lib/media/waveform';

	let { data }: { data: PageData } = $props();
	const writing = $derived(data.writing);

	const paragraphs = $derived(
		data.content
			? data.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
			: []
	);
	const isMarkdown = $derived(Boolean(data.contentHtml));
	const selectedFormat = $derived(data.selectedSource?.format);
	const isPlainText = $derived(selectedFormat === 'txt');
	const isSourceText = $derived(selectedFormat === 'typst' || selectedFormat === 'typ');
	const isPdf = $derived(selectedFormat === 'pdf');

	function glossaryTermName(term: PageData['glossaryTerms'][number]): string {
		const cs = term.translations?.cs;
		return getLocale() === 'cs' && cs?.name ? cs.name : term.name;
	}

	function glossaryTermHref(term: PageData['glossaryTerms'][number]): string {
		const slug = getLocale() === 'cs' ? (term.translations?.cs?.slug ?? term.id) : term.id;
		return localizeUrl(`/glossary/${slug}`);
	}

	const descParagraphs = $derived(
		data.descriptionHtml
			? data.descriptionHtml.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
			: []
	);
	let descExpanded = $state(false);
	const hiddenWordCount = $derived(
		descParagraphs.slice(1).join(' ').replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length
	);

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function formatLabel(source: { format: string; variant?: string }): string {
		const formatMap: Record<string, string> = {
			md: m.writings_format_md(),
			txt: m.writings_format_txt(),
			pdf: m.writings_format_pdf(),
			html: m.writings_format_html(),
			typst: 'typst',
			typ: 'typst',
		};
		const label = formatMap[source.format] ?? source.format;
		return source.variant ? `${label} ${source.variant}` : label;
	}

	function formatHref(source: PageData['readableSources'][number]): string {
		return `${localizeUrl(`/writings/${writing.id}`)}?format=${encodeURIComponent(source.key)}`;
	}

	function formatSize(bytes: number | null | undefined): string {
		if (!bytes) return '—';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function sourceClass(source: PageData['readableSources'][number]): string {
		const active = data.selectedSource?.key === source.key;
		return [
			'relative px-1 pb-5 pt-1 no-underline transition-colors',
			'font-mono text-[10px] uppercase tracking-widest',
			active ? 'text-black after:absolute after:left-1/2 after:top-6 after:-translate-x-1/2 after:text-[11px] after:text-black after:content-["↓"]' : 'text-black/40 hover:text-black',
		].join(' ');
	}

	// Audio player

	type Word = [string, number, number]; // [text, startMs, endMs]
	type Transcript = { words: Word[]; paragraphs: number[] };
	let transcript: Transcript | null = $state(null);
	let proseEl: HTMLElement | undefined = $state();
	let handledTextFollowRequest = 0;
	let pendingTextFollowRequest = $state(0);
	let handledTimestampParam: string | null = null;
	const mediaTrack = $derived<MediaTrack | null>(data.audio ? {
		id: `writing:${writing.id}`,
		title: writing.title,
		subtitle: writing.authors.join(', '),
		href: localizeUrl(`/writings/${writing.id}`),
		src: data.audio.url,
		duration: data.audio.duration,
		durationSeconds: data.audio.durationSeconds,
		peaks: data.audio.peaks,
		followableText: Boolean(data.audio.transcriptUrl),
	} : null);
	const isActiveMediaTrack = $derived(mediaTrack ? mediaPlayer.isTrack(mediaTrack.id) : false);

	async function loadTranscript() {
		if (transcript || !data.audio?.transcriptUrl) return;
		try {
			const res = await fetch(data.audio.transcriptUrl);
			if (res.ok) transcript = await res.json();
		} catch {}
	}

	function parseTimestampParam(raw: string): number | null {
		const value = raw.trim().toLowerCase();
		if (!value) return null;
		if (/^\d+(?:\.\d+)?$/.test(value)) return Number(value);
		if (/^\d{1,2}(?::\d{1,2}){1,2}$/.test(value)) {
			const parts = value.split(':').map(Number);
			return parts.reduce((total, part) => (total * 60) + part, 0);
		}

		const re = /(\d+(?:\.\d+)?)(h|m|s)/g;
		let total = 0;
		let matched = false;
		let lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = re.exec(value)) !== null) {
			if (value.slice(lastIndex, match.index).trim()) return null;
			const amount = Number(match[1]);
			if (match[2] === 'h') total += amount * 3600;
			if (match[2] === 'm') total += amount * 60;
			if (match[2] === 's') total += amount;
			matched = true;
			lastIndex = re.lastIndex;
		}
		if (!matched || value.slice(lastIndex).trim()) return null;
		return total;
	}

	async function playFromTimestamp(seconds: number) {
		if (!mediaTrack) return;
		mediaPlayer.load(mediaTrack);
		mediaPlayer.seek(seconds);
		if (data.audio?.transcriptUrl) void loadTranscript();
		await tick();
		mediaPlayer.seek(seconds);
		try {
			await mediaPlayer.play();
		} catch {
			mediaPlayer.seek(seconds);
		}
	}

	$effect(() => {
		if (!browser || !mediaTrack) return;
		const raw = page.url.searchParams.get('t');
		if (!raw) {
			handledTimestampParam = null;
			return;
		}
		const handledKey = `${mediaTrack.id}:${raw}`;
		if (handledTimestampParam === handledKey) return;
		const seconds = parseTimestampParam(raw);
		handledTimestampParam = handledKey;
		if (seconds === null) return;
		void playFromTimestamp(seconds);
	});

	const currentWordIdx = $derived.by(() => {
		if (!transcript || currentTime === 0) return -1;
		const ms = currentTime * 1000;
		let idx = -1;
		for (let i = 0; i < transcript.words.length; i++) {
			if (ms >= transcript.words[i][1]) idx = i;
			else break;
		}
		return idx;
	});

	const currentParagraphIdx = $derived.by(() => {
		if (!transcript?.paragraphs.length || currentWordIdx < 0) return -1;
		let pi = 0;
		for (let i = 0; i < transcript.paragraphs.length; i++) {
			if (transcript.paragraphs[i] <= currentWordIdx) pi = i;
			else break;
		}
		return pi;
	});

	function scrollToCurrentParagraph(force = false) {
		if (!isMarkdown || !proseEl) return;
		const paras = proseEl.querySelectorAll('p');
		if (textHighlightMode && currentParagraphIdx >= 0) {
			const para = paras[currentParagraphIdx];
			if (para) {
				const rect = para.getBoundingClientRect();
				const gap = 120;
				if (force || rect.top > window.innerHeight - gap || rect.bottom < 0) {
					window.scrollTo({ top: window.scrollY + rect.top - gap, behavior: 'smooth' });
				}
			}
		}
	}

	$effect(() => {
		if (!isMarkdown || !proseEl) return;
		const paras = proseEl.querySelectorAll('p');
		paras.forEach((p, i) => p.classList.toggle('reading-active', textHighlightMode && i === currentParagraphIdx));
		scrollToCurrentParagraph();
	});

	async function followHighlightedTextRequest(request: number) {
		if (!mediaTrack || !mediaPlayer.isTrack(mediaTrack.id)) return;
		handledTextFollowRequest = request;
		pendingTextFollowRequest = request;
		textHighlightMode = true;
		if (data.audio?.transcriptUrl) await loadTranscript();
		await tick();
		scrollToCurrentParagraph(true);
	}

	$effect(() => {
		const request = mediaPlayer.textFollowRequest;
		if (!request || request === handledTextFollowRequest) return;
		void followHighlightedTextRequest(request);
	});

	$effect(() => {
		if (!pendingTextFollowRequest || !textHighlightMode || currentParagraphIdx < 0) return;
		scrollToCurrentParagraph(true);
		pendingTextFollowRequest = 0;
	});

	// CSS Custom Highlight API — word-level highlight without DOM wrapping
	let alignedRanges: (Range | null)[] = [];
	let lastHighlightedWordIdx = -1;
	let fadeRaf: number | null = null;
	let fadingWordHighlights: { range: Range; startedAt: number }[] = [];
	const fadeHighlightNames = ['reading-word-fade-0', 'reading-word-fade-1', 'reading-word-fade-2', 'reading-word-fade-3'];
	const wordHighlightFadeMs = 1000;

	function clearWordHighlights(hl: HighlightRegistry) {
		hl.delete('reading-word');
		for (const name of fadeHighlightNames) hl.delete(name);
		fadingWordHighlights = [];
		lastHighlightedWordIdx = -1;
		if (fadeRaf !== null) cancelAnimationFrame(fadeRaf);
		fadeRaf = null;
	}

	function updateFadingWordHighlights(hl: HighlightRegistry) {
		const now = performance.now();
		fadingWordHighlights = fadingWordHighlights.filter((item) => now - item.startedAt < wordHighlightFadeMs);
		for (const name of fadeHighlightNames) hl.delete(name);

		for (const item of fadingWordHighlights) {
			const progress = (now - item.startedAt) / wordHighlightFadeMs;
			const bucket = Math.min(fadeHighlightNames.length - 1, Math.floor(progress * fadeHighlightNames.length));
			const name = fadeHighlightNames[bucket];
			const existing = hl.get(name);
			if (existing) existing.add(item.range);
			else hl.set(name, new (window as any).Highlight(item.range));
		}

		if (fadingWordHighlights.length > 0) {
			fadeRaf = requestAnimationFrame(() => updateFadingWordHighlights(hl));
		} else {
			fadeRaf = null;
		}
	}

	function buildWordRanges(el: HTMLElement): Range[] {
		const ranges: Range[] = [];
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		let node: Node | null;
		while ((node = walker.nextNode())) {
			const text = (node as Text).textContent ?? '';
			const re = /\S+/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(text)) !== null) {
				const r = document.createRange();
				r.setStart(node, m.index);
				r.setEnd(node, m.index + m[0].length);
				ranges.push(r);
			}
		}
		return ranges;
	}

	function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

	$effect(() => {
		if (!isMarkdown || !proseEl || !transcript) return;
		const docRanges = buildWordRanges(proseEl);
		const docNorm = docRanges.map(r => norm(r.toString()));
		const result: (Range | null)[] = new Array(transcript.words.length).fill(null);
		let di = 0;
		for (let ti = 0; ti < transcript.words.length; ti++) {
			const tw = norm(transcript.words[ti][0]);
			for (let k = 0; k < 8 && di + k < docNorm.length; k++) {
				const dw = docNorm[di + k];
				if (dw === tw || dw.includes(tw) || tw.includes(dw)) {
					result[ti] = docRanges[di + k];
					di = di + k + 1;
					break;
				}
			}
		}
		alignedRanges = result;
	});

	$effect(() => {
		const hl = (CSS as any).highlights;
		if (!hl) return;
		if (!textHighlightMode || currentWordIdx < 0) { clearWordHighlights(hl); return; }
		if (lastHighlightedWordIdx !== currentWordIdx && lastHighlightedWordIdx >= 0) {
			const previousRange = alignedRanges[lastHighlightedWordIdx];
			if (previousRange) {
				fadingWordHighlights.push({ range: previousRange, startedAt: performance.now() });
				if (fadeRaf === null) updateFadingWordHighlights(hl);
			}
		}
		const range = alignedRanges[currentWordIdx];
		if (range) hl.set('reading-word', new (window as any).Highlight(range));
		lastHighlightedWordIdx = currentWordIdx;
		return () => hl.delete('reading-word');
	});

	async function seekToClick(e: MouseEvent) {
		if (!isMarkdown || !mediaTrack) return;
		if (mediaPlayer.track && !isActiveMediaTrack) return;
		if (!isActiveMediaTrack) mediaPlayer.load(mediaTrack);
		if (!transcript) await loadTranscript();
		if (!transcript || alignedRanges.length === 0) return;
		let node: Node | null = null;
		let offset = 0;
		if (document.caretRangeFromPoint) {
			const r = document.caretRangeFromPoint(e.clientX, e.clientY);
			if (r) { node = r.startContainer; offset = r.startOffset; }
		} else if ((document as any).caretPositionFromPoint) {
			const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
			if (pos) { node = pos.offsetNode; offset = pos.offset; }
		}
		if (!node) return;
		let bestIdx = -1;
		for (let i = 0; i < alignedRanges.length; i++) {
			const r = alignedRanges[i];
			if (!r) continue;
			try { if (r.isPointInRange(node, offset)) { bestIdx = i; break; } } catch {}
		}
		if (bestIdx < 0) {
			for (let i = alignedRanges.length - 1; i >= 0; i--) {
				const r = alignedRanges[i];
				if (!r) continue;
				try { if (r.comparePoint(node, offset) >= 0) { bestIdx = i; break; } } catch {}
			}
		}
		if (bestIdx >= 0) mediaPlayer.seek(transcript.words[bestIdx][1] / 1000);
	}

	const currentSentence = $derived.by(() => {
		if (!transcript || currentWordIdx < 0) return null;
		const words = transcript.words;
		const idx = currentWordIdx;
		const isSentenceEnd = (w: Word) => /[.!?]$/.test(w[0]);
		let start = idx;
		while (start > 0 && !isSentenceEnd(words[start - 1])) start--;
		let end = idx;
		while (end < words.length - 1 && !isSentenceEnd(words[end])) end++;
		return { words: words.slice(start, end + 1), activeIdx: idx - start };
	});
	const currentSentenceText = $derived(currentSentence?.words.map((word) => word[0]).join(' ') ?? '');
	const readingPanelLines = $derived(Math.min(7, Math.max(3, Math.ceil(currentSentenceText.length / 78))));

	let waveCanvas: HTMLCanvasElement | undefined = $state();
	let waveformHoverTime: number | null = $state(null);
	const playing = $derived(isActiveMediaTrack && mediaPlayer.playing);
	const currentTime = $derived(isActiveMediaTrack ? mediaPlayer.currentTime : 0);
	const audioDuration = $derived(isActiveMediaTrack ? mediaPlayer.duration : (data.audio?.durationSeconds ?? 0));
	const speed = $derived(mediaPlayer.speed);
	let readingMode = $state(true);
	let textHighlightMode = $state(true);
	const speeds = [0.75, 1, 1.25, 1.5, 2];

	$effect(() => {
		if (isActiveMediaTrack && data.audio?.transcriptUrl) void loadTranscript();
	});

	const peaks = $derived(data.audio?.peaks ? decodePeaks(data.audio.peaks) : null);

	function drawWaveform() {
		if (!waveCanvas || !peaks) return;
		drawWaveformCanvas(waveCanvas, peaks, { currentTime, duration: audioDuration, hoverTime: waveformHoverTime });
	}

	$effect(() => {
		if (!waveCanvas || !peaks) return;
		drawWaveform();
		const ro = new ResizeObserver(drawWaveform);
		ro.observe(waveCanvas);
		return () => ro.disconnect();
	});

	$effect(() => {
		void currentTime;
		void waveformHoverTime;
		drawWaveform();
	});

	function togglePlay() {
		if (playing) {
			mediaPlayer.pause();
		} else {
			loadTranscript();
			if (mediaTrack) void mediaPlayer.play(mediaTrack);
		}
	}

	function setSpeed(rate: number) {
		mediaPlayer.setSpeed(rate);
	}

	function seekFromCanvas(e: MouseEvent) {
		if (!waveCanvas || !mediaTrack) return;
		if (!isActiveMediaTrack) mediaPlayer.load(mediaTrack);
		mediaPlayer.seek(seekTimeFromPointer(e, waveCanvas, audioDuration));
	}

	function previewCanvasSeek(e: PointerEvent) {
		if (!waveCanvas) return;
		waveformHoverTime = hoverTimeFromPointer(e, waveCanvas, audioDuration);
	}

	function resetAudio() {
		if (!isActiveMediaTrack && mediaTrack) mediaPlayer.load(mediaTrack);
		mediaPlayer.reset();
	}

	function resetAudioState() {
		if (isActiveMediaTrack) mediaPlayer.clear();
		const hl = (CSS as any).highlights;
		if (hl) clearWordHighlights(hl);
		proseEl?.querySelectorAll('p').forEach((p) => p.classList.remove('reading-active'));
	}

	function formatTime(s: number): string {
		if (!s || isNaN(s)) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<title>{writing.title} — {m.writings_page_title()}</title>
	<meta name="description" content={data.descriptionHtml?.replace(/<[^>]+>/g, '').slice(0, 160) ?? ''} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<article>
			<!-- Header -->
			<header class="cell-roomy border-b border-line">
				<div class="mx-auto max-w-2xl">
				<a href={localizeUrl('/writings')} class="link-arrow mb-8 inline-block text-[12px]">{m.writings_detail_back()}</a>
					{#if writing.type}
						<p class="label mb-4">{writing.type}</p>
					{/if}
					<h1 class="page-lead mb-4 font-mono">{writing.title}</h1>
					<p class="font-mono text-[13px] text-black/55">
						{writing.authors.join(', ')}
						{#if writing.year}<span class="ml-3 text-black/35">·</span> <span class="ml-3">{writing.year}</span>{/if}
						{#if writing.language}<span class="ml-3 text-black/35">·</span> <span class="ml-3">{new Intl.DisplayNames([getLocale()], { type: 'language' }).of(writing.language) ?? writing.language}</span>{/if}
					</p>

					{#if descParagraphs.length > 0}
						<div class="mt-6 space-y-3 text-[15px] leading-[1.75] text-black/65 italic [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-black/30 [&_a:hover]:decoration-black/60">
							<p>
								{@html descParagraphs[0]}{#if descParagraphs.length > 1 && !descExpanded}<button onclick={() => descExpanded = true} class="not-italic font-mono text-[11px] text-black/35 hover:text-black/60 ml-2 cursor-pointer">{m.writings_learn_more({ count: String(hiddenWordCount) })}</button>{/if}
							</p>
							{#if descExpanded}
								{#each descParagraphs.slice(1) as para}
									<p>{@html para}</p>
								{/each}
								<button onclick={() => descExpanded = false} class="not-italic font-mono text-[11px] text-black/35 hover:text-black/60 cursor-pointer">{m.writings_collapse()}</button>
							{/if}
						</div>
					{/if}

					{#if data.glossaryTerms.length > 0}
						<div class="mt-5 flex flex-wrap gap-2">
							{#each data.glossaryTerms as term}
								<a
									href={glossaryTermHref(term)}
									class="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-black/55 no-underline hover:border-black/40 hover:text-black"
								>{glossaryTermName(term)}</a>
							{/each}
						</div>
					{/if}

					{#if data.audio}
						<div class="mt-6 border px-4 py-3 transition-colors duration-300 {playing ? 'border-black/15 bg-black/[0.04]' : 'border-black/8 bg-black/[0.015]'}">
							<div class="flex items-center gap-4">
								<button
									onclick={togglePlay}
									class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/20 text-black/70 hover:border-black/50 hover:text-black"
									aria-label={playing ? 'Pause' : 'Play'}
								>
									{#if playing}
										<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
											<rect x="1" y="0" width="4" height="14" rx="1"/>
											<rect x="9" y="0" width="4" height="14" rx="1"/>
										</svg>
									{:else}
										<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style="transform: translateX(1px)">
											<polygon points="1,0 13,7 1,14"/>
										</svg>
									{/if}
								</button>

								{#if peaks}
									<canvas
										bind:this={waveCanvas}
										onclick={seekFromCanvas}
										onpointermove={previewCanvasSeek}
										onpointerleave={() => { waveformHoverTime = null; }}
										class="min-w-0 flex-1 cursor-pointer"
										style="height: 48px;"
									></canvas>
								{:else}
									<div class="min-w-0 flex-1"></div>
								{/if}

								<span class="shrink-0 font-mono text-[11px] tabular-nums text-black/40">
									{formatTime(currentTime)}<span class="text-black/20"> / </span>{data.audio.duration ?? formatTime(audioDuration)}
								</span>
							</div>

							<div class="mt-2 flex items-center justify-end gap-3">
								<div class="flex items-center justify-end gap-3">
									{#if currentTime > 0.2}
										<button
											type="button"
											onclick={resetAudioState}
											class="flex h-7 w-7 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
											aria-label="Clear audio state"
											title="Clear audio state"
										>
											<X size={16} strokeWidth={1.8} />
										</button>
										<button
											type="button"
											onclick={resetAudio}
											class="flex h-7 w-7 cursor-pointer items-center justify-center text-black/25 transition-colors hover:text-black/60"
											aria-label="Reset audio"
											title="Reset audio"
										>
											<RotateCcw size={15} strokeWidth={1.8} />
										</button>
									{/if}
									{#if data.audio.transcriptUrl}
										<button
											type="button"
											onclick={() => { readingMode = !readingMode; }}
											class="flex h-7 w-7 cursor-pointer items-center justify-center transition-colors {readingMode ? 'text-black/45 hover:text-black/70' : 'text-black/18 hover:text-black/45'}"
											aria-label={readingMode ? 'Hide reading panel' : 'Show reading panel'}
											aria-pressed={readingMode}
											title={readingMode ? 'Hide reading panel' : 'Show reading panel'}
										>
											<Captions size={16} strokeWidth={1.8} />
										</button>
										<button
											type="button"
											onclick={() => { textHighlightMode = !textHighlightMode; }}
											class="flex h-7 w-7 cursor-pointer items-center justify-center transition-colors {textHighlightMode ? 'text-black/45 hover:text-black/70' : 'text-black/18 hover:text-black/45'}"
											aria-label={textHighlightMode ? 'Hide text highlighting' : 'Show text highlighting'}
											aria-pressed={textHighlightMode}
											title={textHighlightMode ? 'Hide text highlighting' : 'Show text highlighting'}
										>
											<Highlighter size={16} strokeWidth={1.8} />
										</button>
									{/if}
									<span class="font-mono text-[10px] uppercase tracking-widest text-black/25">speed</span>
									{#each speeds as rate}
										<button
											onclick={() => setSpeed(rate)}
											class="cursor-pointer font-mono text-[10px] tabular-nums {speed === rate ? 'text-black' : 'text-black/30 hover:text-black/70'}"
										>{rate}×</button>
									{/each}
								</div>
							</div>

							{#if readingMode && currentSentence}
								<div
									class="reading-panel mt-3 flex items-center overflow-y-auto border-t border-line py-3"
									style={`--reading-lines: ${readingPanelLines}`}
									transition:slide={{ duration: 260 }}
								>
									<p class="w-full text-center text-[13px] leading-[1.7] text-black/50">
										{#each currentSentence.words as word, i}
											<span class={i === currentSentence.activeIdx ? 'text-black font-medium' : ''}>{word[0]}{' '}</span>
										{/each}
									</p>
								</div>
							{/if}
						</div>
					{/if}

					{#if data.readableSources.length > 1}
						<nav class="-mb-10 mt-10 flex max-w-full flex-wrap items-end justify-center gap-x-4 gap-y-1 pt-1" aria-label="Writing formats">
							{#each data.readableSources as source}
								<a
									href={formatHref(source)}
									class={sourceClass(source)}
									aria-current={data.selectedSource?.key === source.key ? 'true' : undefined}
								>{formatLabel(source)}</a>
							{/each}
						</nav>
					{/if}
				</div>
			</header>

			<!-- Body -->
			{#if isMarkdown || paragraphs.length > 0 || isPdf || isSourceText}
				<section class={isPdf ? 'cell-roomy border-b border-line' : 'writing-paper border-b border-line px-8 py-10 lg:px-10 lg:py-12'}>
					{#if isPdf && data.selectedSource}
						<div class="mx-auto max-w-4xl">
							<iframe
								src={data.selectedSource.url}
								title={writing.title}
								class="h-[78vh] min-h-[520px] w-full border border-line bg-white"
							></iframe>
							<div class="mt-3 text-right">
								<a
									href={data.selectedSource.url}
									class="link-external font-mono text-[11px] text-black/45"
									target="_blank"
									rel="noopener noreferrer"
								>{m.writings_open_pdf()}</a>
							</div>
						</div>
					{:else if isSourceText}
						<pre class="mx-auto max-w-2xl overflow-x-auto border-l border-line pl-5 font-mono text-[12px] leading-[1.75] text-black/70"><code>{data.content}</code></pre>
					{:else}
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div
						bind:this={proseEl}
						class="prose mx-auto max-w-2xl"
						class:seek-cursor={isMarkdown && transcript}
						onclick={seekToClick}
					>
							{#if isMarkdown}
								{@html data.contentHtml}
							{:else if isPlainText}
								{#each paragraphs as para}
									<p style="white-space: pre-wrap;">{para}</p>
								{/each}
							{/if}
						</div>
					{/if}
				</section>
			{/if}

			<!-- Footer metadata -->
			<footer class="cell-roomy">
				<div class="mx-auto max-w-2xl space-y-8">
					{#if writing.references.length > 0}
						<div>
							<p class="label mb-3">{m.writings_detail_references()}</p>
							<ul class="space-y-2">
								{#each writing.references as ref}
									<li class="flex items-baseline gap-3 font-mono text-[12px]">
										<span class="w-24 shrink-0 text-[10px] uppercase tracking-widest text-black/35">{ref.role}</span>
										<a href={ref.url} class="link-external break-all text-black/65" target="_blank" rel="noopener noreferrer">{ref.url}</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if data.downloadSources.length > 0}
						<div>
							<p class="label mb-3">{m.writings_detail_sources()}</p>
							<table class="w-full font-mono text-[12px]">
								<tbody>
									{#each data.downloadSources as source}
										<tr class="border-t border-line cursor-pointer hover:bg-bg-muted" onclick={() => window.open(source.url, '_blank')}>
											<td class="py-3 pr-6 text-black/70">{formatLabel(source)}</td>
											<td class="py-3 pr-6 text-[10px] uppercase tracking-widest text-black/30">{source.generated_from ? m.writings_source_generated() : m.writings_source_canonical()}</td>
											<td class="py-3 pr-6 tabular-nums text-black/30">{formatSize(source.size)}</td>
											<td class="py-3 text-right">
												<div class="flex items-center justify-end gap-4">
													<a
														href={source.url}
														class="text-black/45 no-underline hover:text-black"
														target="_blank"
														rel="noopener noreferrer"
													>{m.writings_source_open()}</a>
													<a
														href={source.url}
														class="text-black/45 no-underline hover:text-black"
														target="_blank"
														rel="noopener noreferrer"
														download
													>{m.writings_source_download()}</a>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}

					{#if writing.license}
						<p class="font-mono text-[11px] text-black/35">{writing.license}</p>
					{/if}

					{#if writing.history?.length}
						<div>
							<p class="label mb-3">{m.writings_detail_history()}</p>
							<ul class="space-y-2">
								{#each writing.history as entry}
									<li class="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 font-mono text-[12px]">
										<a href="https://github.com/heterarchy-society/writings/commit/{entry.hash}" class="link-external tabular-nums text-black/45" target="_blank" rel="noopener noreferrer">{entry.hash.slice(0, 7)}</a>
										<span class="text-black/30">{formatDate(entry.date)}</span>
										<span class="text-black/55">{entry.author}</span>
										<span class="text-black/65">{entry.message}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</footer>
		</article>
	</main>

	<Footer />
</div>

<style>
	.writing-paper {
		background: #f8f7f3;
	}

	.prose {
		font-family: Iowan Old Style, Palatino Linotype, Palatino, Charter, Georgia, ui-serif, serif;
		font-variant-ligatures: common-ligatures;
	}

	.prose :global(p) {
		margin-bottom: 1.35rem;
		color: rgba(0,0,0,0.78);
		font-size: 18px;
		line-height: 1.78;
	}

	.prose :global(h1),
	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4) {
		margin-top: 3rem;
		margin-bottom: 0.85rem;
		color: rgba(0,0,0,0.86);
		font-family: var(--font-sans);
		font-weight: 500;
		line-height: 1.35;
	}

	.prose :global(h1) {
		margin-top: 0;
		margin-bottom: 1.6rem;
		font-size: 1.25rem;
	}

	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4) {
		border-top: 1px solid rgba(0,0,0,0.1);
		padding-top: 1.55rem;
	}

	.prose :global(h2) {
		font-size: 1.32rem;
	}

	.prose :global(h3) {
		font-size: 1.12rem;
		font-weight: 550;
	}

	.prose :global(h4) {
		margin-top: 2.25rem;
		margin-bottom: 0.65rem;
		border-top: 0;
		padding-top: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.prose :global(ul),
	.prose :global(ol) {
		margin-bottom: 1.35rem;
		padding-left: 1.5rem;
		color: rgba(0,0,0,0.78);
		font-size: 18px;
		line-height: 1.78;
	}

	.prose :global(li) { margin-bottom: 0.45rem; }

	.prose :global(blockquote) {
		margin: 1.75rem 0;
		border-left: 2px solid rgba(0,0,0,0.14);
		padding-left: 1.15rem;
		color: rgba(0,0,0,0.58);
		font-style: italic;
	}

	.prose :global(a) {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: rgba(0,0,0,0.28);
		text-underline-offset: 0.16em;
	}

	.prose :global(a:hover) {
		text-decoration-color: rgba(0,0,0,0.55);
	}

	.prose :global(.footnote-ref) {
		margin-left: 0.08em;
		font-family: var(--font-sans);
		font-size: 0.68em;
		line-height: 0;
	}

	.prose :global(.footnote-ref a) {
		text-decoration: none;
	}

	.prose :global(.footnotes) {
		margin-top: 2.75rem;
		border-top: 1px solid rgba(0,0,0,0.12);
		padding-top: 1rem;
		font-family: var(--font-sans);
		font-size: 13px;
		line-height: 1.65;
		color: rgba(0,0,0,0.55);
	}

	.prose :global(.footnotes ol) {
		margin: 0;
		padding-left: 0;
		font-size: inherit;
		line-height: inherit;
		list-style: none;
		color: inherit;
	}

	.prose :global(.footnotes li) {
		display: flex;
		gap: 0.55rem;
		margin-bottom: 0.45rem;
	}

	.prose :global(.footnote-number) {
		flex: none;
		min-width: 1.4rem;
		color: rgba(0,0,0,0.4);
		font-variant-numeric: tabular-nums;
	}

	.prose :global(.footnote-backref) {
		flex: none;
		text-decoration: none;
		color: rgba(0,0,0,0.35);
	}

	.prose :global(code) {
		background: rgba(0,0,0,0.045);
		padding: 0.1em 0.3em;
		font-family: var(--font-mono);
		font-size: 0.82em;
	}

	.prose :global(hr) {
		margin: 2rem 0;
		border: none;
		border-top: 1px solid rgba(0,0,0,0.1);
	}

	.seek-cursor :global(*) {
		cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpolygon points='2,1 14,8 2,15' fill='black' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 2 8, crosshair !important;
	}

	.reading-panel {
		height: calc((var(--reading-lines) * 1.7em) + 1.5rem);
		transition: height 260ms ease;
	}

	:global(::highlight(reading-word)) {
		background-color: rgba(253, 224, 71, 0.55);
		color: inherit;
	}

	:global(::highlight(reading-word-fade-0)) {
		background-color: rgba(253, 224, 71, 0.42);
		color: inherit;
	}

	:global(::highlight(reading-word-fade-1)) {
		background-color: rgba(253, 224, 71, 0.3);
		color: inherit;
	}

	:global(::highlight(reading-word-fade-2)) {
		background-color: rgba(253, 224, 71, 0.18);
		color: inherit;
	}

	:global(::highlight(reading-word-fade-3)) {
		background-color: rgba(253, 224, 71, 0.08);
		color: inherit;
	}

	.prose :global(p.reading-active) {
		color: rgba(0,0,0,0.88);
		background: rgba(253, 224, 71, 0.12);
		margin-top: -0.4rem;
		margin-bottom: calc(1.35rem - 0.4rem);
		margin-left: -0.75rem;
		margin-right: -0.75rem;
		padding-top: 0.4rem;
		padding-bottom: 0.4rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
		border-radius: 3px;
	}
</style>
