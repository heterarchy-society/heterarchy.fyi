<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const letters = $derived(() => {
		const set = new Set<string>();
		for (const term of data.terms) set.add(term.name[0].toUpperCase());
		return [...set].sort();
	});

	const byLetter = $derived(() => {
		const map = new Map<string, typeof data.terms>();
		for (const term of data.terms) {
			const l = term.name[0].toUpperCase();
			if (!map.has(l)) map.set(l, []);
			map.get(l)!.push(term);
		}
		return map;
	});
</script>

<svelte:head>
	<title>Glosář — The Heterarchy Society</title>
	<meta name="description" content="Glosář pojmů kolem suverénních technologií, kryptoanarchismu, soukromí a decentralizace." />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">Glosář</p>
			<p class="page-lead mb-10">Pojmy, koncepty a technologie</p>

			<nav class="mb-10 flex flex-wrap gap-2 font-mono text-[12px]">
				{#each letters() as letter}
					<a href="#{letter}" class="border border-line px-2 py-1 no-underline text-black/60 hover:border-black/40 hover:text-black">
						{letter}
					</a>
				{/each}
			</nav>

			<div>
				{#each letters() as letter}
					<div id={letter} class="border-t border-line pt-8 pb-6">
						<p class="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-black/30">{letter}</p>
						<ul class="flex flex-col divide-y divide-line">
							{#each byLetter().get(letter) ?? [] as term}
								<li>
									<a
										href="/glosar/{term.id}"
										class="group flex items-baseline gap-4 py-3 no-underline"
									>
										<span class="font-mono text-[14px] leading-snug group-hover:underline">{term.name}</span>
										{#if term.type}
											<span class="font-mono text-[10px] uppercase tracking-wider text-black/35 whitespace-nowrap">{term.type}</span>
										{/if}
										<span class="ml-auto font-mono text-[12px] text-black/30 group-hover:text-black">→</span>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>

			<p class="mt-8 font-mono text-[11px] text-black/35">{data.terms.length} pojmů</p>
		</section>
	</main>

	<Footer />
</div>
