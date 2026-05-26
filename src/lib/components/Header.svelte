<script lang="ts">
	import { Menu, Search, X } from 'lucide-svelte';
	import { page } from '$app/state';
	import { localizeUrl, getLocale } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { search } from '$lib/search.svelte';

	let open = $state(false);

	function toggle() {
		open = !open;
	}

	$effect(() => {
		page.url.pathname;
		open = false;
	});

	const navItems = $derived([
		{ label: m.nav_home(), href: localizeUrl('/') },
		{ label: m.nav_glossary(), href: localizeUrl('/glossary') },
		{ label: m.nav_writings(), href: localizeUrl('/writings') },
		{ label: m.nav_books(), href: localizeUrl('/books') },
		{ label: m.nav_events(), href: localizeUrl('/events') },
	]);

	const altUrls = $derived((page.data as any)?.altUrls as { en: string; cs: string } | undefined);
	const enHref = $derived(altUrls?.en ?? localizeUrl(page.url.pathname, 'en'));
	const csHref = $derived(altUrls?.cs ?? localizeUrl(page.url.pathname, 'cs'));
	const currentLang = $derived(getLocale());
</script>

<header class="border-b border-line">
	<div class="flex items-center justify-between px-8 py-5">
		<a href={localizeUrl('/')} class="flex items-center gap-2.5 no-underline hover:opacity-75">
			<img src="/logo.svg" alt="Heterarchy" class="h-7 w-auto dark:invert" />
			<span class="font-mono text-[13px]">heterarchy.fyi</span>
		</a>

		<nav class="hidden items-center gap-x-8 font-mono text-[13px] lg:flex" aria-label={m.nav_aria_main()}>
			{#each navItems as item}
				<a href={item.href} class="no-underline hover:underline">{item.label}</a>
			{/each}
			<button
				type="button"
				onclick={() => search.show()}
				class="flex cursor-pointer items-center gap-1.5 border border-line px-2 py-[3px] font-mono text-[11px] text-black/35 transition-colors hover:border-black/20 hover:text-black"
				aria-label={m.search_open()}
			>
				<Search size={12} strokeWidth={1.7} />
				<span class="select-none">⌘K</span>
			</button>
			<ThemeToggle />
			{#if currentLang === 'en'}
				<a href={csHref} class="ml-2 font-mono text-[11px] text-black/40 no-underline hover:text-black" data-sveltekit-reload>česky</a>
			{:else}
				<a href={enHref} class="ml-2 font-mono text-[11px] text-black/40 no-underline hover:text-black" data-sveltekit-reload>english</a>
			{/if}
		</nav>

		<div class="flex items-center gap-4 lg:hidden">
			<button
				type="button"
				onclick={() => search.show()}
				class="flex items-center justify-center text-black/35 transition-colors hover:text-black"
				aria-label={m.search_open()}
			>
				<Search size={18} strokeWidth={1.5} />
			</button>
			<ThemeToggle />
			<button
				type="button"
				class="flex items-center justify-center"
				aria-expanded={open}
				aria-controls="mobile-nav"
				aria-label={open ? m.nav_aria_close() : m.nav_aria_open()}
				onclick={toggle}
			>
				{#if open}
					<X size={22} strokeWidth={1.25} />
				{:else}
					<Menu size={22} strokeWidth={1.25} />
				{/if}
			</button>
		</div>
	</div>

	{#if open}
		<nav
			id="mobile-nav"
			class="border-t border-line font-mono text-[13px] lg:hidden"
			aria-label={m.nav_aria_mobile()}
		>
			{#each navItems as item, i}
				<a
					href={item.href}
					class="block px-8 py-4 no-underline hover:underline"
					class:border-b={i < navItems.length - 1}
					class:border-line={i < navItems.length - 1}
				>
					{item.label}
				</a>
			{/each}
			<div class="px-8 py-4 font-mono text-[11px] text-black/40 border-t border-line">
				{#if currentLang === 'en'}
					<a href={csHref} class="no-underline hover:text-black" data-sveltekit-reload>česky</a>
				{:else}
					<a href={enHref} class="no-underline hover:text-black" data-sveltekit-reload>english</a>
				{/if}
			</div>
		</nav>
	{/if}
</header>
