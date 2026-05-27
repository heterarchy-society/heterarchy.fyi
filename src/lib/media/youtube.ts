let apiReady = false;
let loadPromise: Promise<void> | null = null;

export function loadYouTubeAPI(): Promise<void> {
	if (apiReady) return Promise.resolve();
	if (loadPromise) return loadPromise;

	loadPromise = new Promise((resolve) => {
		if ((window as any).YT?.Player) {
			apiReady = true;
			resolve();
			return;
		}

		const prev = (window as any).onYouTubeIframeAPIReady;
		(window as any).onYouTubeIframeAPIReady = () => {
			apiReady = true;
			if (prev) prev();
			resolve();
		};

		const script = document.createElement('script');
		script.src = 'https://www.youtube.com/iframe_api';
		document.head.appendChild(script);
	});

	return loadPromise;
}
