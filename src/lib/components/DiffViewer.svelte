<script lang="ts">
	import { FileDiff, parsePatchFiles } from '@pierre/diffs';
	import { browser } from '$app/environment';

	let { diff }: { diff: string } = $props();

	let container: HTMLElement;
	let layout = $state<'unified' | 'split'>('unified');
	let instance: FileDiff | null = null;

	function isDarkMode(): boolean {
		return browser && document.documentElement.classList.contains('dark');
	}

	function render() {
		if (!container) return;
		container.innerHTML = '';
		const patches = parsePatchFiles(diff);
		for (const patch of patches) {
			for (const fileDiff of patch.files) {
				instance = new FileDiff({
					theme: { light: 'pierre-light', dark: 'pierre-dark' },
					themeType: isDarkMode() ? 'dark' : 'light',
					diffStyle: layout,
					overflow: 'wrap',
				});
				instance.render({ fileDiff, containerWrapper: container });
			}
		}
	}

	$effect(() => {
		diff; // track prop changes
		render();
	});

	$effect(() => {
		if (!browser) return;
		const observer = new MutationObserver(() => render());
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		return () => observer.disconnect();
	});

	function toggleLayout() {
		layout = layout === 'unified' ? 'split' : 'unified';
		render();
	}
</script>

<div class="mb-4 flex items-center justify-between">
	<span class="font-mono text-[10px] tracking-[0.2em] uppercase">Diff</span>
	<button
		onclick={toggleLayout}
		class="font-mono text-[11px] text-black/40 hover:text-black border border-line px-2 py-1"
	>
		{layout === 'unified' ? 'zobrazit side-by-side' : 'zobrazit stacked'}
	</button>
</div>

<div bind:this={container}></div>
