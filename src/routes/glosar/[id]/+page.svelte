<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const cs = $derived((data.term as any).translations?.cs ?? null);
	const hasCs = $derived(cs?.name && cs?.description);
	const lang = $derived($page.url.searchParams.get('lang') === 'en' ? 'en' : (hasCs ? 'cs' : 'en'));

	const activeName = $derived(lang === 'cs' && hasCs ? cs.name : data.term.name);
	const activeType = $derived(lang === 'cs' && cs?.type ? cs.type : data.term.type);
	const activeDescription = $derived(lang === 'cs' && hasCs ? cs.description : data.term.description);


	function processDescription(text: string, resolvedLinks: any[]): string {
		let i = 0;
		return text.replace(/\[\[([^\|\]]+)\|?([^\]]*)\]\]/g, (_, key) => {
			const resolved = resolvedLinks[i++];
			if (resolved?.target) {
				return `<a href="/glosar/${slugForId(resolved.target)}">${key}</a>`;
			}
			const missingTerm = resolved?.key ?? key;
			return `<a href="/glosar/chybi?term=${encodeURIComponent(missingTerm)}" class="missing-term">${key}</a>`;
		});
	}

	const html = $derived(renderMarkdown(processDescription(activeDescription, data.term.resolvedLinks ?? [])));
	const seeAlso = $derived(data.term.resolvedLinks?.filter((l) => l.target) ?? []);
	const lastEdit = $derived((data.term as any).history?.[0]?.date ?? null);
	const historyCount = $derived((data.term as any).history?.length ?? 0);

	function slugForId(id: string): string {
		const t = data.allTerms?.find((x: any) => x.id === id);
		return (t as any)?.translations?.cs?.slug ?? id;
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{activeName} — Glosář — The Heterarchy Society</title>
	<meta name="description" content={activeDescription.slice(0, 160).replace(/\[\[.*?\]\]/g, '')} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<div class="grid max-w-6xl gap-12 lg:grid-cols-[1fr_240px] lg:gap-40">

				<!-- Left: main content -->
				<div class="min-w-0">
					<a href="/glosar" class="label mb-4 inline-block hover:underline">Glosář</a>
					<h1 class="page-lead mb-2">
						{activeName}<!--
					-->{#if lang === 'cs' && cs && cs.name !== data.term.name}&nbsp;<span class="text-black/35">({data.term.name})</span>{/if}
					</h1>
					{#if activeType}
						<p class="mb-8 font-mono text-[11px] uppercase tracking-widest text-black/40">{activeType}</p>
					{/if}

					<div class="max-w-[80ch] text-[15px] leading-[1.7] text-black/80
						[&_p]:mb-4 [&_p:last-child]:mb-0
						[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-line [&_a:hover]:decoration-black/60
						[&_.missing-term]:decoration-red-600">
						{@html html}
					</div>

					{#if lang === 'cs' && hasCs}
						<div class="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-4">
							<p class="font-mono text-[11px] text-black/35">Přeloženo modelem {cs.model} · {formatDate(cs.translated_at)}</p>
							<a href="?lang=en" class="font-mono text-[11px] text-black/40 hover:text-black no-underline hover:underline whitespace-nowrap">anglicky →</a>
						</div>
					{:else if lang === 'en' && hasCs}
						<div class="mt-6 flex items-baseline justify-end border-t border-line pt-4">
							<a href="?" class="font-mono text-[11px] text-black/40 hover:text-black no-underline hover:underline whitespace-nowrap">← česky</a>
						</div>
					{:else if !hasCs}
						<div class="mt-6 border-t border-line pt-4">
							<p class="font-mono text-[11px] text-black/35">Tento termín zatím nebyl přeložen.</p>
						</div>
					{/if}

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
					<div class="flex flex-col gap-1">
						<a
							href="https://github.com/heterarchy-society/glossary/blob/main/glossary/{data.term.id}.md"
							target="_blank"
							rel="noopener noreferrer"
							class="text-[11px] text-black/40 no-underline hover:underline hover:text-black"
						>→ upravit na GitHubu</a>
						<a
							href="/glosar/{$page.params.id}/historie"
							class="text-[11px] text-black/40 no-underline hover:underline hover:text-black"
						>→ historie editací{#if historyCount > 0}&nbsp;({historyCount}){/if}</a>
						{#if lastEdit}
							<p class="text-[10px] text-black/30">editováno {formatDate(lastEdit)}</p>
						{/if}
					</div>

					{#if data.backlinks.length > 0}
						<div>
							<p class="label mb-3">Backlinks</p>
							<ul class="flex flex-col gap-2">
								{#each data.backlinks as bl}
									{@const blCs = (bl as any).translations?.cs}
									<li>
										<a href="/glosar/{slugForId(bl.id)}" class="no-underline hover:underline leading-snug">
											{blCs?.name || bl.name}
										</a>
										{#if bl.type}
											<span class="block text-[10px] text-black/35">{blCs?.type || bl.type}</span>
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
									{@const linkTerm = data.allTerms?.find((t: any) => t.id === link.target)}
									{@const linkName = (linkTerm as any)?.translations?.cs?.name || link.key}
									<li>
										<a href="/glosar/{slugForId(link.target)}" class="no-underline hover:underline">
											{linkName}
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
