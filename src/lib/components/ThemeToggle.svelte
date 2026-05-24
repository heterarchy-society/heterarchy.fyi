<script lang="ts">
	import { browser } from '$app/environment';
	import { Moon, Sun } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	const storageKey = 'heterarchy-theme';
	let mode = $state<'light' | 'dark'>('light');

	function preferredTheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function applyTheme(next: 'light' | 'dark', persist = false) {
		mode = next;
		document.documentElement.classList.toggle('dark', next === 'dark');
		document.documentElement.style.colorScheme = next;
		if (persist) localStorage.setItem(storageKey, next);
		window.dispatchEvent(new CustomEvent('heterarchy-themechange', { detail: { theme: next } }));
	}

	function toggleTheme() {
		if (!browser) return;
	applyTheme(mode === 'dark' ? 'light' : 'dark', true);
	}

	const label = $derived(mode === 'dark' ? m.theme_switch_light() : m.theme_switch_dark());

	onMount(() => {
		mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
		const stored = localStorage.getItem(storageKey);
		applyTheme(stored === 'dark' || stored === 'light' ? stored : preferredTheme());

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const updateFromSystem = () => {
			if (!localStorage.getItem(storageKey)) applyTheme(preferredTheme());
		};
		media.addEventListener('change', updateFromSystem);
		return () => media.removeEventListener('change', updateFromSystem);
	});
</script>

<button
	type="button"
	onclick={toggleTheme}
	class="flex h-7 w-7 cursor-pointer items-center justify-center text-black/35 transition-colors hover:text-black"
	aria-label={label}
	title={label}
>
	{#if mode === 'dark'}
		<Sun size={15} strokeWidth={1.7} />
	{:else}
		<Moon size={15} strokeWidth={1.7} />
	{/if}
</button>
