import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';
import { localeStorage } from '$lib/locale-storage';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, async ({ request, locale }) => {
		event.request = request;
		return localeStorage.run(locale as 'en' | 'cs', () =>
			resolve(event, {
				transformPageChunk({ html }) {
					return html
						.replace('%paraglide.lang%', locale)
						.replace('%paraglide.textDirection%', getTextDirection(locale));
				},
			})
		);
	});
