import { overwriteGetLocale } from '$lib/paraglide/runtime';
import { localeStorage } from '$lib/locale-storage';
import type { LayoutServerLoad } from './$types';

export const prerender = true;

// Ensure getLocale() reads from our AsyncLocalStorage in this Vite environment
overwriteGetLocale(() => localeStorage.getStore() ?? 'en');

export const load: LayoutServerLoad = () => {
	return {};
};
