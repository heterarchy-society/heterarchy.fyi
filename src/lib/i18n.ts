import { localizeUrl as _localizeUrl, getLocale, getUrlOrigin, locales } from '$lib/paraglide/runtime';

export { getLocale } from '$lib/paraglide/runtime';

type Locale = (typeof locales)[number];

export function localizeUrl(path: string, locale?: Locale): string {
	const origin = getUrlOrigin();
	return _localizeUrl(new URL(path, origin), { locale: locale ?? getLocale() }).pathname;
}
