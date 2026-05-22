<script lang="ts">
	import { Menu, X } from 'lucide-svelte';
	import { page } from '$app/state';
	import { navItems } from '$lib/data/placeholder';

	let open = $state(false);

	$effect(() => {
		page.url.pathname;
		open = false;
	});

	function toggle() {
		open = !open;
	}
</script>

<header class="border-b border-line">
	<div class="flex items-center justify-between px-8 py-5">
		<a href="/" class="flex items-center gap-2.5 no-underline hover:opacity-75">
			<img src="/logo.svg" alt="Heterarchy" class="h-7 w-auto" />
			<span class="font-mono text-[13px]">heterarchy.fyi</span>
		</a>

		<nav class="hidden items-center gap-x-8 font-mono text-[13px] lg:flex" aria-label="Hlavní navigace">
			{#each navItems as item}
				<a href={item.href} class="no-underline hover:underline">{item.label}</a>
			{/each}
		</nav>

		<button
			type="button"
			class="flex items-center justify-center lg:hidden"
			aria-expanded={open}
			aria-controls="mobile-nav"
			aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
			onclick={toggle}
		>
			{#if open}
				<X size={22} strokeWidth={1.25} />
			{:else}
				<Menu size={22} strokeWidth={1.25} />
			{/if}
		</button>
	</div>

	{#if open}
		<nav
			id="mobile-nav"
			class="border-t border-line font-mono text-[13px] lg:hidden"
			aria-label="Mobilní navigace"
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
		</nav>
	{/if}
</header>
