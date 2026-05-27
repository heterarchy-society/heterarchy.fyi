<script lang="ts">
	import { mediaPlayer } from '$lib/media/player.svelte';
	import '@videojs/html/video/skin.css';

	let host: HTMLDivElement | undefined = $state();
	let defined = $state(false);

	$effect(() => {
		Promise.all([
			import('@videojs/html/video/player'),
			import('@videojs/html/video/skin'),
		]).then(() => { defined = true; });
	});

	$effect(() => {
		if (!defined || !mediaPlayer.mediaElReady || !mediaPlayer.track?.isVideo || !host) return;
		const el = mediaPlayer.mediaEl;
		if (!el) return;

		// Build player > skin > video, appending the media BEFORE the player
		// connects so its connectedCallback discovers the <video> synchronously.
		const player = document.createElement('video-player');
		const skin = document.createElement('video-skin');
		player.style.cssText = 'display:block;width:100%;height:100%;';
		skin.style.cssText = 'display:block;width:100%;height:100%;';
		el.setAttribute('playsinline', '');
		el.style.cssText = 'display:block;width:100%;height:100%;';
		skin.appendChild(el);
		player.appendChild(skin);
		host.appendChild(player);

		return () => {
			el.removeAttribute('playsinline');
			el.style.cssText = 'width:100%;height:100%;display:block;';
			mediaPlayer.videoDefaultContainer?.appendChild(el);
			player.remove();
		};
	});
</script>

<div
	bind:this={host}
	class="absolute inset-0 h-full w-full"
	style="--media-border-radius:0; --media-video-border-radius:0;"
></div>
