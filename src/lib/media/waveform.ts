export function decodePeaks(b64: string): number[] {
	const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	return Array.from(new Int8Array(bytes.buffer));
}

type DrawWaveformOptions = {
	currentTime: number;
	duration: number;
	bufferedTime?: number;
	hoverTime?: number | null;
	activeColor?: string;
	inactiveColor?: string;
	bufferedColor?: string;
	hoverColor?: string;
	barWidth?: number;
	step?: number;
};

export function drawWaveform(canvas: HTMLCanvasElement, peaks: number[], options: DrawWaveformOptions) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const dpr = window.devicePixelRatio || 1;
	const width = canvas.offsetWidth;
	const height = canvas.offsetHeight;
	const targetWidth = Math.round(width * dpr);
	const targetHeight = Math.round(height * dpr);

	if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
		canvas.width = targetWidth;
		canvas.height = targetHeight;
	}

	ctx.save();
	ctx.scale(dpr, dpr);
	ctx.clearRect(0, 0, width, height);

	const barWidth = options.barWidth ?? 2;
	const step = options.step ?? 3;
	const numBars = Math.floor(width / step);
	const barCount = peaks.length / 2;
	const progressX = options.duration > 0 ? (options.currentTime / options.duration) * width : 0;
	const bufferedX = options.duration > 0 && options.bufferedTime != null ? (options.bufferedTime / options.duration) * width : progressX;
	const activeColor = options.activeColor ?? 'rgba(0,0,0,0.7)';
	const inactiveColor = options.inactiveColor ?? 'rgba(0,0,0,0.13)';
	const bufferedColor = options.bufferedColor ?? 'rgba(15,118,110,0.35)';
	const hoverColor = options.hoverColor ?? 'rgba(220,38,38,0.85)';

	for (let i = 0; i < numBars; i++) {
		const x = i * step;
		const pi = Math.floor((i / numBars) * barCount);
		const min = peaks[2 * pi] ?? 0;
		const max = peaks[2 * pi + 1] ?? 0;
		const barHeight = Math.max(2, ((max - min) / 255) * height * 0.85);
		const y = (height - barHeight) / 2;
		ctx.fillStyle = x < progressX ? activeColor : x < bufferedX ? bufferedColor : inactiveColor;
		ctx.fillRect(x, y, barWidth, barHeight);
	}

	if (options.hoverTime != null && options.duration > 0) {
		const hoverX = Math.max(0, Math.min(width, (options.hoverTime / options.duration) * width));
		ctx.fillStyle = hoverColor;
		ctx.fillRect(Math.round(hoverX), 0, 1.5, height);
	}

	ctx.restore();
}

export function seekTimeFromPointer(e: MouseEvent, el: HTMLElement, duration: number) {
	const rect = el.getBoundingClientRect();
	const ratio = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0;
	return Math.max(0, Math.min(1, ratio)) * duration;
}

export function hoverTimeFromPointer(e: PointerEvent, el: HTMLElement, duration: number) {
	return seekTimeFromPointer(e as unknown as MouseEvent, el, duration);
}
