<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { version } from '$app/environment';
	import { BookOpen, Calendar, FileText, Globe, Mic, Search, Tag, User, X } from 'lucide-svelte';
	import Fuse from 'fuse.js';
	import { search } from '$lib/search.svelte';
	import { localizeUrl, getLocale } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';

	type SearchEntry = {
		id: string;
		type: 'person' | 'glossary' | 'book' | 'writing' | 'page' | 'event' | 'talk';
		title: string;
		subtitle?: string;
		description?: string;
		url: string;
		thumbnail?: string;
		keywords?: string[];
	};

	type FuseEntry = SearchEntry & {
		_title: string;
		_subtitle: string;
		_description: string;
		_keywords: string[];
	};

	// Strip diacritics so "paralelni" matches "Paralelní"
	const norm = (s: string) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

	let fuse = $state<Fuse<FuseEntry> | null>(null);
	let loading = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);

	async function loadIndex() {
		if (fuse !== null || loading) return;
		loading = true;
		try {
			const res = await fetch(`/search-index-${getLocale()}.json?v=${version}`);
			const data: SearchEntry[] = await res.json();
			const fuseData: FuseEntry[] = data.map((e) => ({
				...e,
				_title: norm(e.title),
				_subtitle: norm(e.subtitle ?? ''),
				_description: norm(e.description ?? ''),
				_keywords: (e.keywords ?? []).map(norm),
			}));
			fuse = new Fuse(fuseData, {
				keys: [
					{ name: '_title', weight: 4 },
					{ name: '_keywords', weight: 3 },
					{ name: '_subtitle', weight: 2 },
					{ name: '_description', weight: 1 },
				],
				threshold: 0.3,
				ignoreLocation: true,
				minMatchCharLength: 2,
			});
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (search.open) {
			loadIndex();
			tick().then(() => inputEl?.focus());
		} else {
			query = '';
			selectedIndex = 0;
		}
	});

	// Reset selection when query changes
	$effect(() => {
		void query;
		selectedIndex = 0;
	});

	// Close on navigation
	$effect(() => {
		void page.url.pathname;
		search.hide();
	});

	const results = $derived.by<SearchEntry[]>(() => {
		if (!fuse || !query.trim()) return [];
		return fuse.search(norm(query.trim()), { limit: 10 }).map((r) => r.item);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter' && results[selectedIndex]) {
			e.preventDefault();
			search.hide();
			goto(localizeUrl(results[selectedIndex].url));
		} else if (e.key === 'Escape') {
			search.hide();
		}
	}

	onMount(() => {
		function handleGlobal(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				search.toggle();
			}
		}
		window.addEventListener('keydown', handleGlobal);
		return () => window.removeEventListener('keydown', handleGlobal);
	});
</script>

{#if search.open}
	<div
		class="fixed inset-0 z-50"
		role="dialog"
		aria-modal="true"
		aria-label="Search"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && search.hide()}
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/20"
			aria-hidden="true"
			onclick={() => search.hide()}
		></div>

		<!-- Panel -->
		<div
			role="none"
			class="relative mx-auto mt-[12vh] w-full max-w-xl border border-line bg-bg shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<!-- Input row -->
			<div class="flex items-center gap-3 border-b border-line px-4 py-3">
				<Search size={15} strokeWidth={1.7} class="shrink-0 text-black/35" />
				<input
					bind:this={inputEl}
					bind:value={query}
					onkeydown={handleKeydown}
					type="search"
					placeholder={m.search_placeholder()}
					autocomplete="off"
					spellcheck="false"
					class="min-w-0 flex-1 bg-transparent font-mono text-[13px] outline-none placeholder:text-black/25 [&::-webkit-search-cancel-button]:hidden"
				/>
				{#if query}
					<button
						type="button"
						onclick={() => { query = ''; inputEl?.focus(); }}
						class="text-black/30 transition-colors hover:text-black"
						aria-label={m.search_clear()}
					>
						<X size={14} strokeWidth={1.7} />
					</button>
				{:else}
					<span class="select-none font-mono text-[11px] text-black/20">esc</span>
				{/if}
			</div>

			<!-- Results -->
			<div class="max-h-[60vh] overflow-y-auto">
				{#if results.length > 0}
					<ul>
						{#each results as entry, i}
							<li>
								<a
									href={localizeUrl(entry.url)}
									onclick={() => search.hide()}
									class="flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-bg-muted"
									class:bg-bg-muted={i === selectedIndex}
									onmouseenter={() => (selectedIndex = i)}
								>
									<!-- Thumbnail / icon -->
									<div
										class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-line bg-bg-muted"
									>
										{#if entry.thumbnail}
											<img
												src={entry.thumbnail}
												alt=""
												class="h-full w-full object-cover"
												loading="lazy"
											/>
										{:else if entry.type === 'glossary'}
											<Tag size={14} strokeWidth={1.5} class="text-black/35" />
										{:else if entry.type === 'book'}
											<BookOpen size={14} strokeWidth={1.5} class="text-black/35" />
										{:else if entry.type === 'writing'}
											<FileText size={14} strokeWidth={1.5} class="text-black/35" />
										{:else if entry.type === 'page'}
											<Globe size={14} strokeWidth={1.5} class="text-black/35" />
										{:else if entry.type === 'event'}
											<Calendar size={14} strokeWidth={1.5} class="text-black/35" />
										{:else if entry.type === 'talk'}
											<Mic size={14} strokeWidth={1.5} class="text-black/35" />
										{:else}
											<User size={14} strokeWidth={1.5} class="text-black/35" />
										{/if}
									</div>

									<!-- Text -->
									<div class="min-w-0 flex-1">
										<div class="truncate font-mono text-[13px]">{entry.title}</div>
										{#if entry.subtitle}
											<div class="truncate font-mono text-[11px] text-black/40">
												{entry.subtitle}
											</div>
										{:else}
											<div class="font-mono text-[11px] capitalize text-black/30">
												{entry.type}
											</div>
										{/if}
									</div>
								</a>
							</li>
						{/each}
					</ul>
				{:else if query && fuse}
					<p class="px-4 py-8 text-center font-mono text-[12px] text-black/35">
						{m.search_no_results({ query })}
					</p>
				{:else if loading}
					<p class="px-4 py-8 text-center font-mono text-[12px] text-black/35">{m.search_loading()}</p>
				{:else}
					<p class="px-4 py-8 text-center font-mono text-[12px] text-black/35">
						{m.search_empty()}
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
