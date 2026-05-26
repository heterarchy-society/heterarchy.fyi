<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LibraryBookCard from '$lib/components/library/LibraryBookCard.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import { writingAuthorText } from '$lib/data/writings';
	import { page } from '$app/stores';
	import { localizeUrl, getLocale } from '$lib/i18n';
	import { datasetUrl, knownCollections } from '$lib/data/routes';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const cs = $derived((data.term as any).translations?.cs ?? null);
	const hasCs = $derived(!!(cs?.name && cs?.description));
	// Use app locale: show Czech content only when app is in Czech AND translation exists
	const showCs = $derived(getLocale() === 'cs' && hasCs);

	const activeName = $derived(showCs ? cs.name : data.term.name);
	const activeType = $derived(showCs && cs?.type ? cs.type : data.term.type);
	const activeDescription = $derived(showCs ? cs.description : data.term.description);
	const relatedTermsById = $derived(new Map(data.relatedTerms.map((term) => [term.id, term])));

	function slugForId(id: string): string {
		const t = relatedTermsById.get(id);
		return (t as any)?.translations?.[getLocale()]?.slug ?? id;
	}

	function termHref(id: string): string {
		return localizeUrl(`/glossary/${slugForId(id)}`);
	}

	function processDescription(text: string, resolvedLinks: any[]): string {
		let i = 0;
		// [[id]] or [[id|display]] — left is the target id, right is visible label
		let result = text.replace(/\[\[([^\|\]]+?)(?:\|([^\]]+?))?\]\]/g, (_, left, right) => {
			const display = (right !== undefined ? right : left).trim();
			const resolved = resolvedLinks[i++];
			if (resolved?.target) {
				return `<a href="${termHref(resolved.target)}">${display}</a>`;
			}
			const missingTerm = resolved?.key ?? left.trim();
			return `<a href="${localizeUrl('/glossary/missing')}?term=${encodeURIComponent(missingTerm)}" class="missing-term">${display}</a>`;
		});
		// [label](collection:id) → cross-dataset link
		result = result.replace(/\[([^\]]+)\]\(([a-z]+):([^)\s]+)\)/g, (full, label, collection, id) => {
			if (!knownCollections.has(collection)) return full;
			const href = datasetUrl(collection, id);
			if (!href) return label;
			return `<a href="${href}">${label}</a>`;
		});
		return result;
	}

	const html = $derived(renderMarkdown(processDescription(activeDescription, data.term.resolvedLinks ?? [])));
	const seeAlso = $derived(
		(data.term.resolvedLinks ?? []).filter((link: any): link is { target: string; key: string } => Boolean(link.target))
	);
	const lastEdit = $derived((data.term as any).history?.[0]?.date ?? null);
	const historyCount = $derived((data.term as any).history?.length ?? 0);
	const bookRows = $derived(
		Array.from({ length: Math.ceil(data.books.length / 2) }, (_, i) => data.books.slice(i * 2, i * 2 + 2))
	);
	const contributors = $derived(
		((data.term as any).authors ?? []) as { name: string; email: string; avatar: string }[]
	);

	const glossaryHref = $derived(localizeUrl('/glossary'));
	const historyHref = $derived(localizeUrl(`/glossary/${$page.params.id}/history`));

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString(getLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>{activeName} — {m.glossary_label()} — The Heterarchy Society</title>
	<meta name="description" content={activeDescription.slice(0, 160).replace(/\[\[.*?\]\]/g, '')} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<div class="grid max-w-6xl gap-12 lg:grid-cols-[1fr_240px] lg:gap-40">

				<!-- Left: main content -->
				<div class="min-w-0">
					<a href={glossaryHref} class="label mb-4 inline-block hover:underline">{m.glossary_label()}</a>
					<h1 class="page-lead mb-2 font-mono">
						{activeName}<!--
					-->{#if showCs && cs.name.toLowerCase() !== data.term.name.toLowerCase()}&nbsp;<span class="text-black/35">({data.term.name})</span>{/if}
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

					{#if showCs}
						<div class="mt-6 border-t border-line pt-4">
							<p class="font-mono text-[11px] text-black/35">{m.glossary_translated_by({ model: cs.model, date: formatDate(cs.translated_at) })}</p>
						</div>
					{:else if getLocale() === 'cs' && !hasCs}
						<div class="mt-6 border-t border-line pt-4">
							<p class="font-mono text-[11px] text-black/35">{m.glossary_not_translated()}</p>
						</div>
					{/if}

					{#if data.books.length > 0}
						<div class="mt-10 border-t border-line pt-8">
							<p class="label mb-4">{m.glossary_books()}</p>
							<div>
								{#each bookRows as row, rowIndex}
									<div class="grid md:grid-cols-2" class:border-t={rowIndex > 0} class:border-line={rowIndex > 0}>
										{#each row as book, colIndex}
											<div
												class="py-5 md:px-5"
												class:pt-0={rowIndex === 0}
												class:max-md:border-t={colIndex > 0}
												class:max-md:border-line={colIndex > 0}
												class:md:border-l={colIndex > 0}
												class:md:border-line={colIndex > 0}
												class:md:pl-5={colIndex > 0}
												class:md:pr-5={colIndex === 0 && row.length > 1}
												class:md:pl-0={colIndex === 0}
												class:md:pr-0={colIndex === row.length - 1 && row.length > 1}
											>
												<LibraryBookCard {book} compact />
											</div>
										{/each}
										{#if row.length === 1 && data.books.length > 1}
											<div class="hidden border-l border-line md:block"></div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if data.writings.length > 0}
						<div class="mt-10 border-t border-line pt-8">
							<p class="label mb-4">{m.nav_writings()}</p>
							<ul class="flex flex-col gap-3">
								{#each data.writings as writing}
									<li>
										<a href={localizeUrl(`/writings/${writing.id}`)} class="group no-underline">
											<span class="block font-mono text-[14px] text-black group-hover:underline">{writing.title}</span>
											<span class="font-mono text-[11px] text-black/40">
												{writingAuthorText(writing.authors)}{#if writing.year}&nbsp;· {writing.year}{/if}
											</span>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if data.term.resources && data.term.resources.length > 0}
						<div class="mt-10 border-t border-line pt-8">
							<p class="label mb-4">{m.glossary_sources()}</p>
							<ul class="flex flex-col gap-3">
								{#each data.term.resources as resource}
									{@const resourceLang = 'lang' in resource ? resource.lang : null}
									<li class="flex items-baseline gap-3">
										<a href={resource.url} target="_blank" rel="noopener noreferrer" class="link-external font-mono text-[13px]">
											{resource.title}
										</a>
										{#if resourceLang}
											<span class="font-mono text-[10px] uppercase tracking-wider text-black/35">{resourceLang}</span>
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
							href="{data.repository}/src/branch/main/glossary/{data.term.id}.md"
							target="_blank"
							rel="noopener noreferrer"
							class="link-external text-[11px] text-black/40 hover:text-black"
						>{m.glossary_edit_on_github()}</a>
						<a href={historyHref} class="text-[11px] text-black/40 no-underline hover:underline hover:text-black">
							{#if historyCount > 0}{m.glossary_edit_history_count({ count: String(historyCount) })}{:else}{m.glossary_edit_history()}{/if}
						</a>
						{#if lastEdit}
							<p class="text-[10px] text-black/30">{m.glossary_last_edited({ date: formatDate(lastEdit) })}</p>
						{/if}
					</div>

					{#if contributors.length > 0}
						<div>
							<p class="label mb-3">{m.glossary_contributors_label()}</p>
							<ul class="flex flex-col gap-2">
								{#each contributors as contributor}
									{@const gh = (contributor as any).gh_username}
									<li class="flex items-center gap-2">
										{#if gh}
											<img src="https://github.com/{gh}.png?size=40" alt={gh} width={20} height={20} class="rounded-full border border-line shrink-0" />
											<a href="https://github.com/{gh}" target="_blank" rel="noopener noreferrer" class="font-mono text-[11px] text-black/70 no-underline hover:underline">{gh}</a>
										{:else}
											<span class="w-5 h-5 rounded-full border border-line bg-bg-muted shrink-0"></span>
											<span class="font-mono text-[11px] text-black/70">{(contributor as any).name}</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if data.backlinks.length > 0}
						<div>
							<p class="label mb-3">{m.glossary_backlinks()}</p>
							<ul class="flex flex-col gap-2">
								{#each data.backlinks as bl}
									{@const blCs = (bl as any).translations?.cs}
									{@const blName = getLocale() === 'cs' && blCs?.name ? blCs.name : bl.name}
									{@const blType = getLocale() === 'cs' && blCs?.type ? blCs.type : bl.type}
									<li>
										<a href={termHref(bl.id)} class="no-underline hover:underline leading-snug">
											{blName}
										</a>
										{#if blType}
											<span class="block text-[10px] text-black/35">{blType}</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if seeAlso.length > 0}
						<div>
							<p class="label mb-3">{m.glossary_see_also()}</p>
								<ul class="flex flex-col gap-2">
									{#each seeAlso as link}
										{@const linkTarget = String(link.target)}
										{@const linkTerm = relatedTermsById.get(linkTarget)}
										{@const linkCsName = (linkTerm as any)?.translations?.cs?.name}
										{@const linkName = getLocale() === 'cs' && linkCsName ? linkCsName : link.key}
										<li>
											<a href={termHref(linkTarget)} class="no-underline hover:underline">
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
