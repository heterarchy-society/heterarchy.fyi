<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LibraryBookCard from '$lib/components/library/LibraryBookCard.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const person = $derived(data.person);

	function refHref(kind: string, value: string): string {
		if (/^https?:\/\//.test(value)) return value;
		if (kind === 'twitter') return `https://x.com/${value}`;
		if (kind === 'github') return `https://github.com/${value}`;
		if (kind === 'nostr') return `https://njump.me/${value}`;
		return value;
	}

	function refLabel(kind: string, value: string): string {
		if (kind === 'web') return m.people_ref_web();
		if (kind === 'twitter') return `@${value}`;
		if (kind === 'github') return value;
		if (kind === 'nostr') return m.people_ref_nostr();
		return kind;
	}

	function formatLifeDate(raw: string): string {
		if (/^\d{4}$/.test(raw)) return raw;
		const d = new Date(raw);
		if (isNaN(d.getTime())) return raw;
		return d.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	const bornLabel = $derived(person.born ? formatLifeDate(person.born) : null);
	const diedLabel = $derived(person.died ? formatLifeDate(person.died) : null);

	const allAvatars = $derived([
		...(person.avatarUrl ? [person.avatarUrl] : []),
		...person.avatarAltUrls
	]);
	let activeAvatarIdx = $state(0);
	const activeAvatarUrl = $derived(allAvatars[activeAvatarIdx] ?? null);
</script>

<svelte:head>
	<title>{person.name} — {m.people_page_label()}</title>
	<meta name="description" content={person.description ?? m.people_page_lead()} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<a href={localizeUrl('/people')} class="link-arrow mb-8 inline-block text-[12px]">{m.people_detail_back()}</a>

			<div class="grid gap-10 lg:grid-cols-[minmax(180px,260px)_1fr] lg:gap-14">
				<div class="mx-auto w-full max-w-65 lg:mx-0">
					{#if activeAvatarUrl}
						<img
							src={activeAvatarUrl}
							alt={m.people_avatar_alt({ name: person.name })}
							width={260}
							height={260}
							class="aspect-square w-full border border-line object-cover"
						/>
					{:else}
						<div class="aspect-square w-full border border-line bg-bg-muted" aria-hidden="true"></div>
					{/if}

					{#if allAvatars.length > 1}
						<div class="mt-2 flex gap-1.5">
							{#each allAvatars as url, i}
								<button
									type="button"
									onclick={() => (activeAvatarIdx = i)}
									class="size-8 shrink-0 overflow-hidden border transition-colors {activeAvatarIdx === i ? 'border-black/50' : 'border-line hover:border-black/30'}"
									aria-label="Avatar {i + 1}"
								>
									<img src={url} alt="" class="h-full w-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="min-w-0">
					<p class="label mb-4">{m.people_detail_label()}</p>
					<h1 class="book-detail-title mb-4 max-w-2xl">{person.name}</h1>

					{#if bornLabel || diedLabel}
						<p class="mb-4 flex gap-4 font-mono text-[12px] text-black/40">
							{#if bornLabel}<span><span class="mr-1.5 text-black/25">∗</span>{bornLabel}</span>{/if}
							{#if diedLabel}<span><span class="mr-1.5 text-black/25">†</span>{diedLabel}</span>{/if}
						</p>
					{/if}

					{#if person.caption}
						<p class="mb-6 max-w-2xl text-[15px] leading-[1.65] text-black/65">{person.caption}</p>
					{/if}

					{#if person.altNames?.length}
						<p class="font-mono text-[12px] leading-relaxed text-black/45">
							{m.people_aliases()} {person.altNames.join(' · ')}
						</p>
					{/if}

					{#if person.description}
						<div class="mt-8 max-w-2xl">
							<p class="label mb-3">{m.people_detail_about()}</p>
							<p class="text-[15px] leading-[1.7] text-black/80">{person.description}</p>
						</div>
					{/if}

					{#if data.books.length > 0}
						<div class="mt-8 max-w-3xl">
							<p class="label mb-4">{m.books_label()}</p>
							<div class="grid gap-5 sm:grid-cols-2">
								{#each data.books as book (book.id)}
									<LibraryBookCard {book} compact />
								{/each}
							</div>
						</div>
					{/if}

					{#if data.writings.length > 0}
						<div class="mt-8 max-w-3xl">
							<p class="label mb-4">{m.writings_page_label()}</p>
							<ul class="divide-y divide-line">
								{#each data.writings as writing (writing.id)}
									<li>
										<a href={localizeUrl(`/writings/${writing.id}`)} class="group flex items-baseline justify-between gap-4 py-3 no-underline">
											<span class="font-mono text-[13px] text-black group-hover:underline">{writing.title}</span>
											<span class="shrink-0 font-mono text-[11px] text-black/35">{writing.year ?? ''}</span>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if person.refs}
						<div class="mt-8">
							<p class="label mb-3">{m.people_detail_refs()}</p>
							<ul class="flex flex-col gap-3">
								{#each Object.entries(person.refs) as [kind, value]}
									<li>
										<a href={refHref(kind, value)} class="link-external font-mono text-[13px]" target="_blank" rel="noopener noreferrer">
											{refLabel(kind, value)}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<p class="mt-10 font-mono text-[11px] text-black/45">
						<a
							href="https://github.com/heterarchy-society/people/tree/main/people/{person.id}"
							class="link-external"
							target="_blank"
							rel="noopener noreferrer"
						>
							{m.people_detail_source()}
						</a>
					</p>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
