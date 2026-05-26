<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { renderMarkdown } from '$lib/markdown';
	import { page } from '$app/state';
	import { getLocale, localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';
	import { writingAuthorRefs, writingAuthorText } from '$lib/data/writings';
	import { personAvatarUrl, imageSrcset, personPath } from '$lib/data/people';
	import { tick } from 'svelte';
	import { fly, slide } from 'svelte/transition';
	import { Captions, Download, Highlighter, Info, Pencil, RotateCcw, X } from 'lucide-svelte';
	import { mediaPlayer, type MediaTrack } from '$lib/media/player.svelte';
	import { decodePeaks, drawWaveform as drawWaveformCanvas, hoverTimeFromPointer, seekTimeFromPointer } from '$lib/media/waveform';

	let { data }: { data: PageData } = $props();
	const writing = $derived(data.writing);

	let activeSource = $state(data.selectedSource);
	let activeContent = $state(data.content);
	let activeContentHtml = $state(data.contentHtml);
	let loadingContent = $state(false);

	$effect(() => {
		activeSource = data.selectedSource;
		activeContent = data.content;
		activeContentHtml = data.contentHtml;
	});

	const writingWordCount = $derived((() => {
		if (!writing._assets) return null;
		for (const s of writing.sources) {
			if (['md', 'txt'].includes(s.format) && !s.generated_from) {
				const w = writing._assets[s.path]?.text?.words;
				if (w) return w;
			}
		}
		return null;
	})());

	const paragraphs = $derived(
		activeContent
			? activeContent.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
			: []
	);
	const isMarkdown = $derived(Boolean(activeContentHtml));
	const selectedFormat = $derived(activeSource?.format);
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
		return new Date(iso).toLocaleDateString(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function formatWordCount(count: number): string {
		const label = count >= 1000 ? `${Math.round(count / 100) / 10}k` : String(count);
		return m.writings_word_count({ count: label });
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
		const active = activeSource?.key === source.key;
		return [
			'relative px-1 pb-5 pt-1 no-underline transition-colors',
			'font-mono text-[10px] uppercase tracking-widest',
			active ? 'text-black' : 'text-black/40 hover:text-black',
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
		subtitle: writingAuthorText(writing.authors),
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

	let altPressed = $state(false);
	let altHoverWordIdx = $state(-1);

	$effect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Alt') {
				altPressed = true;
				if (isMarkdown && data.audio?.transcriptUrl) void loadTranscript();
			}
		}
		function onKeyUp(e: KeyboardEvent) { if (e.key === 'Alt') { altPressed = false; altHoverWordIdx = -1; } }
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
	});

	$effect(() => {
		const hl = (CSS as any).highlights;
		if (!hl) return;
		if (altHoverWordIdx < 0) { hl.delete('alt-hover-word'); return; }
		const range = alignedRanges[altHoverWordIdx];
		if (range) hl.set('alt-hover-word', new (window as any).Highlight(range));
		else hl.delete('alt-hover-word');
		return () => hl.delete('alt-hover-word');
	});

	function findWordIdxAtPoint(clientX: number, clientY: number): number {
		let node: Node | null = null;
		let offset = 0;
		if (document.caretRangeFromPoint) {
			const r = document.caretRangeFromPoint(clientX, clientY);
			if (r) { node = r.startContainer; offset = r.startOffset; }
		} else if ((document as any).caretPositionFromPoint) {
			const pos = (document as any).caretPositionFromPoint(clientX, clientY);
			if (pos) { node = pos.offsetNode; offset = pos.offset; }
		}
		if (!node) return -1;
		for (let i = 0; i < alignedRanges.length; i++) {
			const r = alignedRanges[i];
			if (!r) continue;
			try { if (r.isPointInRange(node, offset)) return i; } catch {}
		}
		return -1;
	}

	function proseMouseMove(e: MouseEvent) {
		if (!altPressed || alignedRanges.length === 0) { altHoverWordIdx = -1; return; }
		altHoverWordIdx = findWordIdxAtPoint(e.clientX, e.clientY);
	}

	async function seekToClick(e: MouseEvent) {
		if (!e.altKey || !isMarkdown || !mediaTrack) return;
		e.preventDefault();
		if (!transcript) await loadTranscript();
		if (!transcript || alignedRanges.length === 0) return;
		const bestIdx = findWordIdxAtPoint(e.clientX, e.clientY);
		if (bestIdx >= 0) {
			const seekTime = transcript.words[bestIdx][1] / 1000;
			await mediaPlayer.play(mediaTrack);
			mediaPlayer.seek(seekTime);
		}
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
	let waveformScrubbing = false;
	const playing = $derived(isActiveMediaTrack && mediaPlayer.playing);
	const currentTime = $derived(isActiveMediaTrack ? mediaPlayer.currentTime : 0);
	const audioDuration = $derived(isActiveMediaTrack ? mediaPlayer.duration : (data.audio?.durationSeconds ?? 0));
	const speed = $derived(mediaPlayer.speed);
	let readingMode = $state(true);
	let textHighlightMode = $state(true);
	let audioInfoOpen = $state(false);
	const speeds = [0.75, 1, 1.25, 1.5, 2];

	$effect(() => {
		if (isActiveMediaTrack && data.audio?.transcriptUrl) void loadTranscript();
	});

	const peaks = $derived(data.audio?.peaks ? decodePeaks(data.audio.peaks) : null);

	function drawWaveform() {
		if (!waveCanvas || !peaks) return;
		drawWaveformCanvas(waveCanvas, peaks, { currentTime, duration: audioDuration, bufferedTime: mediaPlayer.bufferedTime, hoverTime: waveformHoverTime });
	}

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
		void currentTime;
		void waveformHoverTime;
		void mediaPlayer.bufferedTime;
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

	function seekFromCanvas(e: PointerEvent, playIfIdle = false) {
		if (!waveCanvas || !mediaTrack) return;
		if (!isActiveMediaTrack) mediaPlayer.load(mediaTrack);
		mediaPlayer.seek(seekTimeFromPointer(e, waveCanvas, audioDuration));
		if (playIfIdle && !playing) {
			loadTranscript();
			void mediaPlayer.play();
		}
	}

	function waveformPointerDown(e: PointerEvent) {
		if (!waveCanvas) return;
		waveformScrubbing = true;
		waveCanvas.setPointerCapture(e.pointerId);
		seekFromCanvas(e, true);
	}

	function waveformPointerMove(e: PointerEvent) {
		if (!waveCanvas) return;
		if (waveformScrubbing) seekFromCanvas(e);
		waveformHoverTime = hoverTimeFromPointer(e, waveCanvas, audioDuration);
	}

	function waveformPointerUp() {
		waveformScrubbing = false;
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

	async function downloadAudio() {
		const src = data.audio?.url;
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
	{#if data.contentHtml?.includes('katex')}
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" crossorigin="anonymous" />
	{/if}
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
					<h1 class="page-lead mb-4 font-mono">{writing.title.replace(/-/g, '‑')}</h1>
					<div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[13px] text-black/55">
						{#each writingAuthorRefs(writing.authors) as author}
							{#if author.person}
								<a href={localizeUrl(personPath(author.person.id))} class="group inline-flex items-center gap-2 text-inherit no-underline hover:text-black">
									{#if personAvatarUrl(author.person)}
										<img src={personAvatarUrl(author.person) ?? ''} srcset={imageSrcset(author.person.avatarVersions)} sizes="32px" alt={author.person.name} width={32} height={32} class="size-8 border border-line object-cover" />
									{/if}
									<span class="group-hover:underline">{author.person.name}</span>
								</a>
							{:else}
								<span>{author.name}</span>
							{/if}
						{/each}
						{#if writing.year}<span class="text-black/35">·</span> <span>{writing.year}</span>{/if}
						{#if writing.language}<span class="text-black/35">·</span> <span>{new Intl.DisplayNames([getLocale()], { type: 'language' }).of(writing.language) ?? writing.language}</span>{/if}
						{#if writingWordCount !== null}<span class="text-black/35">·</span> <span class="text-black/40">{formatWordCount(writingWordCount)}</span>{/if}
					</div>

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
									aria-label={playing ? m.audio_pause() : m.audio_play()}
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
										onpointerdown={waveformPointerDown}
										onpointermove={waveformPointerMove}
										onpointerup={waveformPointerUp}
										onpointercancel={waveformPointerUp}
										onpointerleave={() => { if (!waveformScrubbing) waveformHoverTime = null; }}
										class="min-w-0 flex-1 cursor-pointer"
										style="height: 48px;"
										aria-label={m.audio_seek()}
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
											aria-label={m.audio_clear_state()}
											title={m.audio_clear_state()}
										>
											<X size={16} strokeWidth={1.8} />
										</button>
										<button
											type="button"
											onclick={resetAudio}
											class="flex h-7 w-7 cursor-pointer items-center justify-center text-black/25 transition-colors hover:text-black/60"
											aria-label={m.audio_reset()}
											title={m.audio_reset()}
										>
											<RotateCcw size={15} strokeWidth={1.8} />
										</button>
									{/if}
									{#if data.audio.transcriptUrl}
										<button
											type="button"
											onclick={() => { readingMode = !readingMode; }}
											class="flex h-7 w-7 cursor-pointer items-center justify-center transition-colors {readingMode ? 'text-black/45 hover:text-black/70' : 'text-black/18 hover:text-black/45'}"
											aria-label={readingMode ? m.audio_hide_reading_panel() : m.audio_show_reading_panel()}
											aria-pressed={readingMode}
											title={readingMode ? m.audio_hide_reading_panel() : m.audio_show_reading_panel()}
										>
											<Captions size={16} strokeWidth={1.8} />
										</button>
										<button
											type="button"
											onclick={() => { textHighlightMode = !textHighlightMode; }}
											class="flex h-7 w-7 cursor-pointer items-center justify-center transition-colors {textHighlightMode ? 'text-black/45 hover:text-black/70' : 'text-black/18 hover:text-black/45'}"
											aria-label={textHighlightMode ? m.audio_hide_text_highlighting() : m.audio_show_text_highlighting()}
											aria-pressed={textHighlightMode}
											title={textHighlightMode ? m.audio_hide_text_highlighting() : m.audio_show_text_highlighting()}
										>
											<Highlighter size={16} strokeWidth={1.8} />
										</button>
									{/if}
									<button
										type="button"
										onclick={downloadAudio}
										class="flex h-7 w-7 cursor-pointer items-center justify-center text-black/20 transition-colors hover:text-black/55"
										aria-label={m.audio_download()}
										title={m.audio_download()}
									>
										<Download size={15} strokeWidth={1.8} />
									</button>
									<button
										type="button"
										onclick={() => { audioInfoOpen = !audioInfoOpen; }}
										class="flex h-7 w-7 cursor-pointer items-center justify-center transition-colors {audioInfoOpen ? 'text-black/45 hover:text-black/70' : 'text-black/20 hover:text-black/55'}"
										aria-label={m.audio_info()}
										title={m.audio_info()}
									>
										<Info size={15} strokeWidth={1.8} />
									</button>
									<span class="font-mono text-[10px] uppercase tracking-widest text-black/25">{m.audio_speed()}</span>
									{#each speeds as rate}
										<button
											onclick={() => setSpeed(rate)}
											class="cursor-pointer font-mono text-[10px] tabular-nums {speed === rate ? 'text-black' : 'text-black/30 hover:text-black/70'}"
										>{rate}×</button>
									{/each}
								</div>
							</div>

							{#if audioInfoOpen}
								<div transition:slide={{ duration: 200 }} class="mt-3 border-t border-line px-4 py-4 font-mono text-[11px] text-black/50">
									<dl class="space-y-1.5">
										<div class="flex gap-4">
											<dt class="w-24 shrink-0 uppercase tracking-widest text-black/30">{m.audio_source()}</dt>
											<dd class="min-w-0 break-all"><a href={data.audio.url} target="_blank" rel="noopener noreferrer" class="text-black/60 hover:text-black">{data.audio.url}</a></dd>
										</div>
										<div class="flex gap-4">
											<dt class="w-24 shrink-0 uppercase tracking-widest text-black/30">{m.audio_format()}</dt>
											<dd>{data.audio.url.split('.').pop()?.toUpperCase() ?? '—'}</dd>
										</div>
										{#if data.audio.duration}
											<div class="flex gap-4">
												<dt class="w-24 shrink-0 uppercase tracking-widest text-black/30">{m.audio_duration()}</dt>
												<dd>{data.audio.duration}</dd>
											</div>
										{/if}
										<div class="flex gap-4">
											<dt class="w-24 shrink-0 uppercase tracking-widest text-black/30">{m.audio_waveform()}</dt>
											<dd>{data.audio.peaks ? m.common_yes() : m.common_no()}</dd>
										</div>
										<div class="flex gap-4">
											<dt class="w-24 shrink-0 uppercase tracking-widest text-black/30">{m.audio_transcript()}</dt>
											<dd>{#if data.audio.transcriptUrl}<a href={data.audio.transcriptUrl} target="_blank" rel="noopener noreferrer" class="text-black/60 hover:text-black">{m.common_yes()}</a>{:else}{m.common_no()}{/if}</dd>
										</div>
									</dl>
								</div>
							{/if}

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
						<nav class="-mb-10 mt-10 flex max-w-full flex-wrap items-end justify-center gap-x-4 gap-y-1 pt-1" aria-label={m.writings_formats_nav()}>
							{#each data.readableSources as source}
								{@const active = activeSource?.key === source.key}
								<a
									href={formatHref(source)}
									onclick={async (e) => {
										e.preventDefault();
										if (activeSource?.key === source.key) return;
										replaceState(formatHref(source), {});
										activeSource = source;
										activeContent = null;
										activeContentHtml = null;
										if (source.format !== 'pdf') {
											loadingContent = true;
											try {
												const res = await fetch(source.url);
												if (res.ok) {
													const raw = await res.text();
													const base = source.url.replace(/\/[^/]+$/, '/');
													const rebase = (html: string) =>
														html.replace(/\s(src|href)="(?!https?:\/\/|\/\/|#)([^"]+)"/g, ` $1="${base}$2"`);
													if (source.format === 'md') {
														const bodyMarker = raw.indexOf('<!-- body -->');
														const body = bodyMarker !== -1 ? raw.slice(bodyMarker + '<!-- body -->'.length).trimStart() : raw;
														activeContentHtml = rebase(renderMarkdown(body));
													} else if (source.format === 'html') {
														activeContentHtml = rebase(raw);
													} else {
														activeContent = raw;
													}
												}
											} catch {}
											loadingContent = false;
										}
									}}
									class={sourceClass(source)}
									aria-current={active ? 'true' : undefined}
								>
									{formatLabel(source)}
									{#if active}
										<span
											in:fly={{ y: -5, duration: 200 }}
											out:fly={{ y: -5, duration: 150 }}
											class="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-[11px] text-black"
										>↓</span>
									{/if}
								</a>
							{/each}
						</nav>
					{/if}
				</div>
			</header>

			<!-- Body -->
			{#if loadingContent}
				<section class="writing-paper border-b border-line px-8 py-10 lg:px-10 lg:py-12">
					<div class="mx-auto max-w-2xl space-y-3 animate-pulse">
						{#each [1, 0.95, 0.88, 1, 0.6, 0.92, 0.78, 1, 0.85, 0.4] as w}
							<div class="h-[1.1em] rounded-sm bg-black/8" style="width: {w * 100}%"></div>
						{/each}
					</div>
				</section>
			{:else if isMarkdown || paragraphs.length > 0 || isPdf || isSourceText}
				<section class={isPdf ? 'cell-roomy border-b border-line' : 'writing-paper border-b border-line px-8 py-10 lg:px-10 lg:py-12'}>
					{#if isPdf && activeSource}
						<div class="mx-auto max-w-4xl">
							<iframe
								src={activeSource.url}
								title={writing.title}
								class="h-[78vh] min-h-[520px] w-full border border-line bg-white"
							></iframe>
							<div class="mt-3 text-right">
								<a
									href={activeSource?.url}
									class="link-external font-mono text-[11px] text-black/45"
									target="_blank"
									rel="noopener noreferrer"
								>{m.writings_open_pdf()}</a>
							</div>
						</div>
					{:else if isSourceText}
						<pre class="mx-auto max-w-2xl overflow-x-auto border-l border-line pl-5 font-mono text-[12px] leading-[1.75] text-black/70"><code>{activeContent}</code></pre>
					{:else}
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div
						bind:this={proseEl}
						class="prose mx-auto max-w-2xl"
						class:seek-cursor={altPressed && isMarkdown && !!transcript}
						onmousemove={proseMouseMove}
						onmouseleave={() => { altHoverWordIdx = -1; }}
						onclick={seekToClick}
					>
							{#if isMarkdown}
								{@html activeContentHtml}
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

					<a href="https://github.com/heterarchy-society/writings/tree/main/writings/{writing.id}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 font-mono text-[11px] text-black/30 no-underline transition-colors hover:text-black/60" title={m.writings_edit_on_github()}>
						<Pencil size={11} strokeWidth={1.8} />
						edit on github
					</a>

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
		background: var(--theme-paper);
	}

	.prose {
		color: color-mix(in srgb, var(--theme-ink) 78%, transparent);
		font-family: Iowan Old Style, Palatino Linotype, Palatino, Charter, Georgia, ui-serif, serif;
		font-variant-ligatures: common-ligatures;
		--prose-text: color-mix(in srgb, var(--theme-ink) 78%, transparent);
		--prose-strong: color-mix(in srgb, var(--theme-ink) 88%, transparent);
		--prose-heading: color-mix(in srgb, var(--theme-ink) 86%, transparent);
		--prose-muted: color-mix(in srgb, var(--theme-ink) 55%, transparent);
		--prose-faint: color-mix(in srgb, var(--theme-ink) 35%, transparent);
		--prose-line: color-mix(in srgb, var(--theme-ink) 12%, transparent);
		--prose-soft-bg: color-mix(in srgb, var(--theme-ink) 4.5%, transparent);
	}

	.prose :global(p) {
		margin-bottom: 1.35rem;
		color: var(--prose-text);
		font-size: 18px;
		line-height: 1.78;
	}

	.prose :global(strong),
	.prose :global(b) {
		color: var(--prose-strong);
		font-weight: 650;
	}

	.prose :global(em),
	.prose :global(i) {
		color: inherit;
	}

	.prose :global(h1),
	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4) {
		margin-top: 3rem;
		margin-bottom: 0.85rem;
		color: var(--prose-heading);
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
		border-top: 1px solid var(--prose-line);
		padding-top: 1.55rem;
	}

	.prose :global(h2:first-child),
	.prose :global(h3:first-child),
	.prose :global(h4:first-child) {
		margin-top: 0;
		border-top: none;
		padding-top: 0;
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
		color: var(--prose-text);
		font-size: 18px;
		line-height: 1.78;
	}

	.prose :global(ul) { list-style-type: disc; }
	.prose :global(ol) { list-style-type: decimal; }

	.prose :global(li) { margin-bottom: 0.45rem; }

	.prose :global(blockquote) {
		margin: 1.75rem 0;
		border-left: 2px solid color-mix(in srgb, var(--theme-ink) 14%, transparent);
		padding-left: 1.15rem;
		color: color-mix(in srgb, var(--theme-ink) 58%, transparent);
		font-style: italic;
	}

	.prose :global(a) {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--theme-ink) 28%, transparent);
		text-underline-offset: 0.16em;
	}

	.prose :global(a:hover) {
		text-decoration-color: color-mix(in srgb, var(--theme-ink) 55%, transparent);
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
		border-top: 1px solid var(--prose-line);
		padding-top: 1rem;
		font-family: var(--font-sans);
		font-size: 13px;
		line-height: 1.65;
		color: var(--prose-muted);
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
		color: color-mix(in srgb, var(--theme-ink) 40%, transparent);
		font-variant-numeric: tabular-nums;
	}

	.prose :global(.footnote-backref) {
		flex: none;
		text-decoration: none;
		color: var(--prose-faint);
	}

	.prose :global(code) {
		background: var(--prose-soft-bg);
		padding: 0.1em 0.3em;
		font-family: var(--font-mono);
		font-size: 0.82em;
		word-break: break-all;
		overflow-wrap: break-word;
	}

	.prose :global(hr) {
		margin: 2rem 0;
		border: none;
		border-top: 1px solid var(--prose-line);
	}

	.prose :global(pre) {
		margin: 1.75rem 0;
		overflow-x: auto;
		border-left: 1px solid var(--prose-line);
		background: var(--prose-soft-bg);
		padding: 1rem 1.15rem;
		color: var(--prose-text);
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.65;
	}

	.prose :global(pre code) {
		background: transparent;
		padding: 0;
		font-size: inherit;
	}

	.prose :global(table) {
		margin: 1.75rem 0;
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-sans);
		font-size: 14px;
		color: var(--prose-text);
	}

	.prose :global(th),
	.prose :global(td) {
		border-top: 1px solid var(--prose-line);
		padding: 0.55rem 0.7rem 0.55rem 0;
		text-align: left;
		vertical-align: top;
	}

	.prose :global(th) {
		color: var(--prose-strong);
		font-weight: 600;
	}

	.prose :global(img) {
		border: 1px solid var(--prose-line);
		display: block;
		margin-left: auto;
		margin-right: auto;
	}

	.prose :global(figcaption) {
		margin-top: 0.65rem;
		color: var(--prose-muted);
		font-family: var(--font-sans);
		font-size: 12px;
		line-height: 1.55;
	}

	.prose :global(::selection) {
		background: color-mix(in srgb, rgb(253, 224, 71) 30%, transparent);
		color: var(--theme-ink);
	}

	.seek-cursor :global(*) {
		cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpolygon points='2,1 14,8 2,15' fill='black' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 2 8, crosshair !important;
	}

	.reading-panel {
		height: calc((var(--reading-lines) * 1.7em) + 1.5rem);
		transition: height 260ms ease;
	}

	:global(::highlight(alt-hover-word)) {
		background-color: color-mix(in srgb, var(--theme-ink) 8%, transparent);
		color: inherit;
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
		color: color-mix(in srgb, var(--theme-ink) 88%, transparent);
		background: color-mix(in srgb, rgb(253, 224, 71) 12%, transparent);
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

	/* Shiki dual-theme: apply light/dark variables based on root class */
	.prose :global(.shiki span) {
		color: var(--shiki-light);
	}

	:global(.dark) .prose :global(.shiki span) {
		color: var(--shiki-dark);
	}

	/* Math */
	.prose :global(.math-block) {
		margin: 1.75rem 0;
		text-align: center;
	}

	.prose :global(.katex-display) {
		margin: 0;
		overflow-x: visible;
		overflow-y: visible;
	}

	.prose :global(.katex) {
		font-size: 1.3em;
	}

	/* Anchor targets for inline citations */
	.prose :global([id^="ref-"]) {
		scroll-margin-top: 5rem;
	}
</style>
