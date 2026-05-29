<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Manifesto from '$lib/components/about/Manifesto.svelte';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const pad = 'px-8 py-10 lg:px-10 lg:py-12';

	const heroLines = $derived([
		{ text: m.about_hero_line_1(), muted: false },
		{ text: m.about_hero_line_2(), muted: false },
		{ text: m.about_hero_line_3(), muted: true },
	]);

	const values = $derived([
		{ title: m.about_value_1_title(), description: m.about_value_1_desc() },
		{ title: m.about_value_2_title(), description: m.about_value_2_desc() },
		{ title: m.about_value_3_title(), description: m.about_value_3_desc() },
		{ title: m.about_value_4_title(), description: m.about_value_4_desc() },
	]);

	function valueCellClass(i: number): string {
		if (i === 0) return `${pad} border-b border-line sm:border-r lg:border-b-0`;
		if (i === 1) return `${pad} border-b border-line lg:border-b-0 lg:border-r`;
		if (i === 2) return `${pad} border-b border-line sm:border-r sm:border-b-0 lg:border-r`;
		return pad;
	}
</script>

<svelte:head>
	<title>{m.about_meta_title()}</title>
	<meta name="description" content={m.about_meta_desc()} />
</svelte:head>

<Seo title={m.about_meta_title()} description={m.about_meta_desc()} />

<div class="min-h-screen w-full">
	<Header />

	<main>
		<!-- Hero -->
		<section class="cell-roomy border-b border-line">
			<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
				<div class="flex flex-col gap-8">
					<h1 class="font-mono text-[2rem] leading-[1.15] tracking-[-0.01em] lg:text-[2.75rem]">
						{#each heroLines as line}
							<span class="block {line.muted ? 'text-black/35' : ''}">{line.text}</span>
						{/each}
					</h1>
					<p class="max-w-md text-[15px] leading-[1.7] text-black/70">{m.about_hero_intro()}</p>
					<a href={localizeUrl('/join')} class="link-arrow w-fit text-[13px]">{m.hero_cta_join()}</a>
				</div>

				<div class="hidden items-center justify-end lg:flex">
					<img
						src="/logo.svg"
						alt=""
						class="w-full max-w-[340px] opacity-[0.1] dark:invert dark:opacity-[0.15]"
						aria-hidden="true"
					/>
				</div>
			</div>
		</section>

		<!-- Values -->
		<section>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{#each values as value, i}
					<div class={valueCellClass(i)}>
						<p class="label mb-3">{value.title}</p>
						<p class="text-[14px] leading-[1.65] text-black/65">{value.description}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Manifesto + Contributors -->
		<div class="grid border-t border-b border-line lg:grid-cols-3">
			<div class="cell-roomy lg:col-span-2">
				<Manifesto labeled />
			</div>
			<div class="cell-roomy lg:col-span-1">
				<p class="label mb-5">{m.about_contributors()}</p>
				<ul class="flex flex-col gap-3">
					{#each data.contributors as person}
						<li>
							<a href={localizeUrl(`/people/${person.id}`)} class="group flex items-center gap-3 no-underline">
								{#if person.avatarUrl}
									<img
										src={person.avatarUrl}
										srcset={person.avatarSrcset}
										sizes="32px"
										alt={person.name}
										class="h-8 w-8 shrink-0 border border-line object-cover"
										loading="lazy"
									/>
								{:else}
									<div class="h-8 w-8 shrink-0 border border-line bg-bg-muted"></div>
								{/if}
								<span class="font-mono text-[13px] text-black/65 group-hover:text-black">{person.name}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</main>

	<Footer />
</div>
