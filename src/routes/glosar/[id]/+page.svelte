<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function processDescription(text: string): string {
		return text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
			const display = label || target;
			const resolved = data.term.resolvedLinks?.find(
				(l) => l.key.toLowerCase() === target.toLowerCase()
			);
			if (resolved?.target) {
				return `<a href="/glosar/${resolved.target}">${display}</a>`;
			}
			return `<a href="/glosar/chybi?term=${encodeURIComponent(target)}" class="missing-term">${display}</a>`;
		});
	}

	const html = $derived(renderMarkdown(processDescription(data.term.description)));
	const seeAlso = $derived(data.term.resolvedLinks?.filter((l) => l.target) ?? []);
</script>

<svelte:head>
	<title>{data.term.name} — Glosář — The Heterarchy Society</title>
	<meta name="description" content={data.term.description.slice(0, 160).replace(/\[\[.*?\]\]/g, '')} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href="/glosar" class="link-arrow mb-8 inline-block text-[12px]">← glosář</a>

			<div class="grid max-w-6xl gap-12 lg:grid-cols-[1fr_240px] lg:gap-40">

				<!-- Left: main content -->
				<div class="min-w-0">
					<p class="label mb-4">Glosář</p>
					<h1 class="page-lead mb-2">{data.term.name}</h1>
					{#if data.term.type}
						<p class="mb-8 font-mono text-[11px] uppercase tracking-widest text-black/40">{data.term.type}</p>
					{/if}

					<div class="max-w-[80ch] text-[15px] leading-[1.7] text-black/80
						[&_p]:mb-4 [&_p:last-child]:mb-0
						[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-line [&_a:hover]:decoration-black/60
						[&_.missing-term]:decoration-red-600">
						{@html html}
					</div>

					{#if data.term.resources && data.term.resources.length > 0}
						<div class="mt-10 border-t border-line pt-8">
							<p class="label mb-4">Zdroje</p>
							<ul class="flex flex-col gap-3">
								{#each data.term.resources as resource}
									<li class="flex items-baseline gap-3">
										<a
											href={resource.url}
											target="_blank"
											rel="noopener noreferrer"
											class="link-arrow text-[13px]"
										>
											→ {resource.title}
										</a>
										{#if resource.lang}
											<span class="font-mono text-[10px] uppercase tracking-wider text-black/35">{resource.lang}</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<!-- Right: sidebar -->
				<aside class="flex flex-col gap-8 border-t border-line pt-8 font-mono text-[12px] lg:border-t-0 lg:border-l lg:border-line lg:pl-8 lg:pt-0">
					{#if data.backlinks.length > 0}
						<div>
							<p class="label mb-3">Backlinks</p>
							<ul class="flex flex-col gap-2">
								{#each data.backlinks as bl}
									<li>
										<a href="/glosar/{bl.id}" class="no-underline hover:underline leading-snug">
											{bl.name}
										</a>
										{#if bl.type}
											<span class="block text-[10px] text-black/35">{bl.type}</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if seeAlso.length > 0}
						<div>
							<p class="label mb-3">Viz také</p>
							<ul class="flex flex-col gap-2">
								{#each seeAlso as link}
									<li>
										<a href="/glosar/{link.target}" class="no-underline hover:underline">
											{link.key}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</aside>
			</div>
		</section>
	</main>

	<Footer />
</div>
