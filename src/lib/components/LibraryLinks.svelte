<script lang="ts">
	import { Archive, Asterisk, Book, Wrench } from 'lucide-svelte';
	import type { LibraryLink } from '$lib/data/placeholder';

	let { links }: { links: LibraryLink[] } = $props();

	const icons = {
		book: Book,
		asterisk: Asterisk,
		wrench: Wrench,
		archive: Archive
	} as const;
</script>

<section>
	<p class="label">Knihovna / zdroje</p>

	<ul class="font-mono text-[13px]">
		{#each links as link, i}
			{@const Icon = icons[link.icon]}
			<li class:border-b-0={i === links.length - 1} class="border-b border-black">
				<a href={link.href} class="flex items-center gap-3 py-4 no-underline hover:underline">
					<Icon size={14} strokeWidth={1.25} />
					<span class="flex-1">{link.label}</span>
					<span>→</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
