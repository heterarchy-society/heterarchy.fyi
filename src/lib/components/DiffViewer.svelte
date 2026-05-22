<script lang="ts">
	import { onMount } from 'svelte';
	import { FileDiff, parsePatchFiles } from '@pierre/diffs';

	let { diff }: { diff: string } = $props();

	let container: HTMLElement;
	let layout = $state<'unified' | 'split'>('unified');
	let instance: FileDiff | null = null;

	function render() {
		if (!container) return;
		container.innerHTML = '';
		const patches = parsePatchFiles(diff);
		for (const patch of patches) {
			for (const fileDiff of patch.files) {
				instance = new FileDiff({
					theme: 'pierre-light',
					diffStyle: layout,
					overflow: 'wrap',
				});
				instance.render({ fileDiff, containerWrapper: container });
			}
		}
	}

	onMount(() => render());

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
