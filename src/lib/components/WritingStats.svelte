<script lang="ts">
	import { Headphones } from 'lucide-svelte';

	type Writing = {
		sources: { path: string; format: string; variant?: string; generated_from?: string }[];
		audio?: { url: string; duration?: string }[];
		_assets?: Record<string, { text?: { words?: number } }>;
	};

	let { writing }: { writing: Writing } = $props();

	function wordCount(): number | null {
		if (!writing._assets) return null;
		for (const source of writing.sources) {
			if (['md', 'txt'].includes(source.format) && !source.generated_from) {
				const words = writing._assets[source.path]?.text?.words;
				if (words) return words;
			}
		}
		return null;
	}

	function formatWords(n: number): string {
		return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n);
	}

	const words = $derived(wordCount());
	const audio = $derived(writing.audio?.[0]);
</script>

{#if words !== null || audio}
	<span class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-black/30">
		{#if words !== null}
			<span>{formatWords(words)}W</span>
		{/if}
		{#if audio}
			<span class="flex items-center gap-1">
				<Headphones size={11} strokeWidth={1.8} />
				{#if audio.duration}
					<span>{audio.duration}</span>
				{/if}
			</span>
		{/if}
	</span>
{/if}
