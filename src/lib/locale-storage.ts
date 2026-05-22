import { AsyncLocalStorage } from 'node:async_hooks';

type Locale = 'en' | 'cs';

declare global {
	var __paraglide_locale__: AsyncLocalStorage<Locale> | undefined;
}

// Singleton via globalThis so Vite SSR module isolation doesn't create two instances
if (!globalThis.__paraglide_locale__) {
	globalThis.__paraglide_locale__ = new AsyncLocalStorage<Locale>();
}

export const localeStorage = globalThis.__paraglide_locale__;
export type { Locale };
