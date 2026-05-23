import { redirect } from '@sveltejs/kit';
import { localizeUrl } from '$lib/i18n';

export function load() {
	redirect(301, localizeUrl('/open-data'));
}
