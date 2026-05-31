import { building } from '$app/environment';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';
import { localeStorage } from '$lib/locale-storage';
import type { Handle } from '@sveltejs/kit';

const paraglideHandle: Handle = ({ event, resolve }) =>
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

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Statuses that must not include a response body (e.g. prerender=false → 204). */
function responseBody(status: number, body: ArrayBuffer): ArrayBuffer | null {
	return status === 204 || status === 205 || status === 304 ? null : body;
}

let prerenderCount = 0;
let prerenderSummaryScheduled = false;

function schedulePrerenderSummary() {
	if (prerenderSummaryScheduled) return;
	prerenderSummaryScheduled = true;
	process.once('beforeExit', () => {
		console.log(`📄 [PRERENDER] ${prerenderCount} pages`);
	});
}

export const handle: Handle = async (input) => {
	if (building) {
		schedulePrerenderSummary();
		const start = performance.now();
		const response = await paraglideHandle(input);
		const body = await response.arrayBuffer();
		const elapsed = performance.now() - start;
		prerenderCount++;
		if (elapsed > 50) {
			const size =
				response.status === 204 || response.status === 205 || response.status === 304
					? `HTTP ${response.status}`
					: formatBytes(body.byteLength);
			console.log(
				`⏱️ [PRERENDER #${prerenderCount}] ${input.event.url.pathname} took ${elapsed.toFixed(2)}ms (${size})`
			);
		}
		return new Response(responseBody(response.status, body), {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});
	}

	return paraglideHandle(input);
};
