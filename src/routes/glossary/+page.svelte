<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { localizeUrl, getLocale } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function displayName(term: any): string {
		if (getLocale() === 'cs') {
			return term.translations?.cs?.name ?? term.name;
		}
		return term.name;
	}

	function displayType(term: any): string | null {
		if (getLocale() === 'cs') {
			return term.translations?.cs?.type ?? term.type ?? null;
		}
		return term.type ?? null;
	}

	function termHref(term: any): string {
		// On CS locale use CS slug, on EN use EN id
		const id = getLocale() === 'cs'
			? (term.translations?.cs?.slug ?? term.id)
			: term.id;
		return localizeUrl(`/glossary/${id}`);
	}

	const letters = $derived(() => {
		const locale = getLocale() === 'cs' ? 'cs' : 'en';
		const set = new Set<string>();
		for (const term of data.terms) set.add(displayName(term)[0].toUpperCase());
		return [...set].sort((a, b) => a.localeCompare(b, locale));
	});

	const byLetter = $derived(() => {
		const locale = getLocale() === 'cs' ? 'cs' : 'en';
		const map = new Map<string, typeof data.terms>();
		for (const term of data.terms) {
			const l = displayName(term)[0].toUpperCase();
			if (!map.has(l)) map.set(l, []);
			map.get(l)!.push(term);
		}
		for (const [, bucket] of map) {
			bucket.sort((a, b) => displayName(a).localeCompare(displayName(b), locale));
		}
		return map;
	});
</script>

<svelte:head>
	<title>{m.glossary_label()} — The Heterarchy Society</title>
	<meta name="description" content={m.glossary_lead()} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">{m.glossary_label()}</p>
			<p class="page-lead mb-10">{m.glossary_lead()}</p>

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
								{@const csTranslated = getLocale() === 'cs' && term.translations?.cs?.name}
								{@const type = displayType(term)}
								<li>
									<a href={termHref(term)} class="group flex items-baseline gap-3 py-3 no-underline">
										<span class="font-mono text-[14px] leading-snug">
											<span class="group-hover:underline">{displayName(term)}</span>
											{#if csTranslated && term.translations?.cs?.name !== term.name}
												<span class="text-black/35 no-underline"> ({term.name})</span>
											{/if}
										</span>
										{#if type}
											<span class="font-mono text-[10px] uppercase tracking-wider text-black/35 whitespace-nowrap">{type}</span>
										{/if}
										<span class="ml-auto font-mono text-[12px] text-black/30 group-hover:text-black">→</span>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>

			<p class="mt-8 font-mono text-[11px] text-black/35">{m.glossary_term_count({ count: String(data.terms.length) })}</p>
		</section>
	</main>

	<Footer />
</div>
