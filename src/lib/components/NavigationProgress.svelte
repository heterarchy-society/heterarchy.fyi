<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	let visible = $state(false);
	let finishing = $state(false);
	let progress = $state(0);
	let showTimer: number | null = null;
	let hideTimer: number | null = null;
	let progressTimer: number | null = null;

	function clearTimer(timer: number | null) {
		if (timer !== null) window.clearTimeout(timer);
	}

	function start() {
		clearTimer(showTimer);
		clearTimer(hideTimer);
		clearTimer(progressTimer);
		finishing = false;
		progress = 8;
		visible = true;
		progressTimer = window.setInterval(() => {
			progress += Math.max(0.4, (88 - progress) * 0.08);
			if (progress > 88) progress = 88;
		}, 120);
	}

	function finish() {
		clearTimer(showTimer);
		clearTimer(progressTimer);
		showTimer = null;
		progressTimer = null;
		if (!visible) return;
		progress = 100;
		finishing = true;
		hideTimer = window.setTimeout(() => {
			visible = false;
			finishing = false;
			progress = 0;
			hideTimer = null;
		}, 180);
	}

	beforeNavigate(({ willUnload }) => {
		if (!willUnload) start();
	});

	afterNavigate(finish);
</script>

{#if visible}
	<progress
		class="navigation-progress"
		class:navigation-progress-finish={finishing}
		max="100"
		value={progress}
		aria-label={m.common_loading()}
	></progress>
{/if}

<style>
	.navigation-progress {
		position: fixed;
		inset: 0 0 auto;
		z-index: 100;
		width: 100%;
		height: 2px;
		border: 0;
		appearance: none;
		opacity: 1;
		background: transparent;
		transition: opacity 180ms ease;
	}

	.navigation-progress-finish {
		opacity: 0;
	}

	.navigation-progress::-webkit-progress-bar {
		background: transparent;
	}

	.navigation-progress::-webkit-progress-value {
		background: var(--theme-ink);
		transition: width 120ms ease;
	}

	.navigation-progress::-moz-progress-bar {
		background: var(--theme-ink);
		transition: width 120ms ease;
	}
</style>
