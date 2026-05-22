import { AsyncLocalStorage } from 'node:async_hooks';

type Locale = 'en' | 'cs';

// Singleton via globalThis so Vite SSR module isolation doesn't create two instances
if (!globalThis.__paraglide_locale__) {
	(globalThis as any).__paraglide_locale__ = new AsyncLocalStorage<Locale>();
}

export const localeStorage: AsyncLocalStorage<Locale> = (globalThis as any).__paraglide_locale__;
export type { Locale };
