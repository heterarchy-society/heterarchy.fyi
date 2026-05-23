<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { assets } from '$app/paths';
	import { updated } from '$app/state';
	import { version } from '$app/environment';
	import { onMount } from 'svelte';

	const seenVersionKey = 'heterarchy.app.version';
	const reloadParam = '__v';

	function rememberNewestVersion(currentVersion: string) {
		const seen = localStorage.getItem(seenVersionKey);
		if (seen !== currentVersion) {
			localStorage.setItem(seenVersionKey, currentVersion);
		}
	}

	function cacheBustedUrl(nextVersion: string): string {
		const url = new URL(location.href);
		url.searchParams.set(reloadParam, nextVersion);
		return url.href;
	}

	onMount(async () => {
		rememberNewestVersion(version);

		try {
			const res = await fetch(`${assets}/_app/version.json`, {
				headers: {
					pragma: 'no-cache',
					'cache-control': 'no-cache'
				}
			});
			if (!res.ok) return;

			const latest = (await res.json()) as { version?: string };
			if (!latest.version) return;

			const seen = localStorage.getItem(seenVersionKey);
			if (latest.version !== version || (seen && seen !== version)) {
				localStorage.setItem(seenVersionKey, latest.version);
				location.replace(cacheBustedUrl(latest.version));
			}
		} catch {
			// If the version probe fails, normal SvelteKit version polling still handles future navigations.
		}
	});

	beforeNavigate(({ to, willUnload }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});
</script>
