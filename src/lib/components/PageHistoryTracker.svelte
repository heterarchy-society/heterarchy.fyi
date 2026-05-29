<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		addPageHistoryDuration,
		startPageHistoryVisit,
		updatePageHistoryTitle,
	} from '$lib/page-history';

	const FLUSH_INTERVAL_MS = 10_000;
	const SITE_TITLE_SUFFIX = /\s+[—-]\s+The Heterarchy Society$/;

	type ActiveVisit = {
		path: string;
		title: string;
		lastSavedAt: number;
		paused: boolean;
	};

	let activeVisit: ActiveVisit | null = null;
	let flushTimer: number | null = null;

	function pagePath(url: URL): string {
		return `${url.pathname}${url.search}` || '/';
	}

	function normalizedRoute(path: string): string {
		const pathname = path.split('?')[0].replace(/\/$/, '') || '/';
		return pathname.replace(/^\/cs(?=\/|$)/, '') || '/';
	}

	function shouldTrack(path: string): boolean {
		return normalizedRoute(path) !== '/browsing-history';
	}

	function isCurrentPath(path: string): boolean {
		return pagePath(new URL(window.location.href)) === path;
	}

	function currentTitle(fallback: string): string {
		return document.title.replace(SITE_TITLE_SUFFIX, '').trim() || fallback;
	}

	function updateActiveVisitTitle(): void {
		if (!activeVisit || !isCurrentPath(activeVisit.path)) return;

		const title = currentTitle(activeVisit.path);
		if (title === activeVisit.title) return;

		activeVisit.title = title;
		updatePageHistoryTitle(activeVisit.path, title);
	}

	function updateStoredTitleSoon(): void {
		window.requestAnimationFrame(updateActiveVisitTitle);
		window.setTimeout(updateActiveVisitTitle, 50);
	}

	function flushActiveVisit(now = Date.now()): void {
		if (!activeVisit || activeVisit.paused) return;

		const deltaMs = now - activeVisit.lastSavedAt;
		activeVisit.lastSavedAt = now;
		if (deltaMs <= 0) return;

		const title = isCurrentPath(activeVisit.path) ? currentTitle(activeVisit.path) : activeVisit.title;
		activeVisit.title = title;
		addPageHistoryDuration({
			path: activeVisit.path,
			title,
			now,
			deltaMs,
		});
	}

	function beginVisit(url: URL): void {
		const path = pagePath(url);
		const now = Date.now();

		if (activeVisit?.path === path) {
			updateStoredTitleSoon();
			return;
		}

		flushActiveVisit(now);
		activeVisit = null;

		if (!shouldTrack(path)) return;

		const title = currentTitle(path);
		activeVisit = {
			path,
			title,
			lastSavedAt: now,
			paused: document.hidden,
		};
		startPageHistoryVisit({ path, title, now });
		updateStoredTitleSoon();
	}

	function handleVisibilityChange(): void {
		if (!activeVisit) return;

		const now = Date.now();
		if (document.hidden) {
			flushActiveVisit(now);
			activeVisit.paused = true;
			return;
		}

		activeVisit.paused = false;
		activeVisit.lastSavedAt = now;
		updateStoredTitleSoon();
	}

	afterNavigate(({ to }) => {
		if (!browser || !to?.url) return;
		beginVisit(to.url);
	});

	onMount(() => {
		beginVisit(new URL(window.location.href));
		const handlePageHide = () => flushActiveVisit();
		const handleBeforeUnload = () => flushActiveVisit();
		const titleObserver = new MutationObserver(updateActiveVisitTitle);
		titleObserver.observe(document.head, { childList: true, characterData: true, subtree: true });

		flushTimer = window.setInterval(() => flushActiveVisit(), FLUSH_INTERVAL_MS);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('pagehide', handlePageHide);
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			flushActiveVisit();
			if (flushTimer) window.clearInterval(flushTimer);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('pagehide', handlePageHide);
			window.removeEventListener('beforeunload', handleBeforeUnload);
			titleObserver.disconnect();
		};
	});
</script>
