<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';

	const CELL_PX = 4;
	const TICK_MS = 200;
	const STABLE_LIMIT = 14;
	const MIN_CELLS = 16;
	const MAX_CELLS = 12000;
	let wrapEl = $state<HTMLDivElement | null>(null);
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let imageData: ImageData | null = null;

	let cols = 0;
	let rows = 0;
	let current: Uint8Array = new Uint8Array(0);
	let next: Uint8Array = new Uint8Array(0);
	let stableTicks = 0;
	let liveCount = $state(0);
	let frameId = 0;
	let lastTick = 0;
	let resizeTimer: ReturnType<typeof setTimeout> | undefined;

	const alivePixel = new Uint8ClampedArray([0, 0, 0, 255]);
	const deadPixel = new Uint8ClampedArray([250, 248, 244, 255]);

	function thresholds() {
		const cells = cols * rows;
		return {
			target: Math.floor(cells * 0.25),
			low: Math.floor(cells * 0.11),
			critical: Math.max(8, Math.floor(cells * 0.025))
		};
	}

	function idx(r: number, c: number) {
		return r * cols + c;
	}

	/** Počáteční počet — řídce až středně; náhodná mřížka nad ~25 % rychle vymírá. */
	function randomInitialPopulation() {
		const cells = cols * rows;
		const { critical } = thresholds();
		const roll = Math.random();

		if (roll < 0.3) {
			const min = Math.max(critical, Math.floor(cells * 0.02));
			const max = Math.max(min + 1, Math.floor(cells * 0.07));
			return min + Math.floor(Math.random() * (max - min));
		}
		if (roll < 0.65) {
			const min = Math.floor(cells * 0.07);
			const max = Math.floor(cells * 0.13);
			return min + Math.floor(Math.random() * Math.max(1, max - min));
		}
		if (roll < 0.88) {
			const min = Math.floor(cells * 0.13);
			const max = Math.floor(cells * 0.19);
			return min + Math.floor(Math.random() * Math.max(1, max - min));
		}
		if (roll < 0.96) {
			const min = Math.floor(cells * 0.19);
			const max = Math.floor(cells * 0.26);
			return min + Math.floor(Math.random() * Math.max(1, max - min));
		}
		const min = Math.floor(cells * 0.26);
		const max = Math.floor(cells * 0.32);
		return min + Math.floor(Math.random() * Math.max(1, max - min));
	}

	function randomGridWithPopulation(count: number) {
		const cells = cols * rows;
		const g = new Uint8Array(cells);
		let need = Math.max(0, Math.min(cells, count));

		for (let i = 0; i < cells && need > 0; i++) {
			if (Math.random() < need / (cells - i)) {
				g[i] = 1;
				need--;
			}
		}

		return g;
	}

	function randomGrid() {
		return randomGridWithPopulation(randomInitialPopulation());
	}

	/** Nová náhodná populace (klik, start, auto-restart). */
	function seedGrid() {
		if (cols === 0 || rows === 0) return false;
		current = randomGrid();
		stableTicks = 0;
		return true;
	}

	function population(g: Uint8Array) {
		let n = 0;
		for (let i = 0; i < g.length; i++) if (g[i]) n++;
		return n;
	}

	function gridsEqual(a: Uint8Array, b: Uint8Array) {
		for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
		return true;
	}

	function countNeighbors(r: number, c: number) {
		let n = 0;
		for (let dr = -1; dr <= 1; dr++) {
			for (let dc = -1; dc <= 1; dc++) {
				if (!dr && !dc) continue;
				const rr = r + dr;
				const cc = c + dc;
				if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && current[idx(rr, cc)]) n++;
			}
		}
		return n;
	}

	function nextGeneration() {
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const i = idx(r, c);
				const alive = current[i];
				const neighbors = countNeighbors(r, c);
				if (alive) next[i] = neighbors === 2 || neighbors === 3 ? 1 : 0;
				else next[i] = neighbors === 3 ? 1 : 0;
			}
		}
		const swap = current;
		current = next;
		next = swap;
	}

	function spawnLife(count: number) {
		if (count <= 0) return;

		const near: number[] = [];
		const far: number[] = [];

		for (let i = 0; i < current.length; i++) {
			if (current[i]) continue;

			const r = (i / cols) | 0;
			const c = i % cols;
			let hasAliveNeighbor = false;

			for (let dr = -1; dr <= 1 && !hasAliveNeighbor; dr++) {
				for (let dc = -1; dc <= 1; dc++) {
					if (!dr && !dc) continue;
					const rr = r + dr;
					const cc = c + dc;
					if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && current[idx(rr, cc)]) {
						hasAliveNeighbor = true;
						break;
					}
				}
			}

			(hasAliveNeighbor ? near : far).push(i);
		}

		const pool = near.length > 0 ? near : far;
		if (pool.length === 0) return;

		for (let i = pool.length - 1; i > 0; i--) {
			const j = (Math.random() * (i + 1)) | 0;
			[pool[i], pool[j]] = [pool[j], pool[i]];
		}

		let added = 0;
		for (let n = 0; n < pool.length && added < count; n++) {
			const i = pool[n];
			if (!current[i]) {
				current[i] = 1;
				added++;
			}
		}
	}

	function draw() {
		const canvas = canvasEl;
		if (!canvas || cols === 0 || rows === 0) return;

		const ctx = canvas.getContext('2d', { alpha: false });
		if (!ctx) return;

		if (!imageData || imageData.width !== cols || imageData.height !== rows) {
			imageData = ctx.createImageData(cols, rows);
		}
		const data = imageData.data;

		for (let i = 0; i < current.length; i++) {
			const src = current[i] ? alivePixel : deadPixel;
			const o = i * 4;
			data[o] = src[0];
			data[o + 1] = src[1];
			data[o + 2] = src[2];
			data[o + 3] = src[3];
		}

		ctx.putImageData(imageData, 0, 0);
		liveCount = population(current);
	}

	function step() {
		if (cols === 0 || rows === 0) return;

		nextGeneration();

		const { target, low, critical } = thresholds();
		stableTicks = gridsEqual(current, next) ? stableTicks + 1 : 0;

		const pop = population(current);

		if (pop < critical || stableTicks >= STABLE_LIMIT) {
			seedGrid();
		} else if (pop < target) {
			const deficit = target - pop;
			const batch =
				pop < low
					? Math.max(2, Math.min(10, Math.ceil(deficit * 0.08)))
					: Math.max(1, Math.min(4, Math.ceil(deficit * 0.04)));
			spawnLife(batch);
		}

		draw();
	}

	function reset() {
		if (cols === 0 || rows === 0) {
			applyLayout();
			return;
		}
		seedGrid();
		draw();
	}

	function applyLayout() {
		if (!wrapEl || !canvasEl) return;

		const w = Math.floor(wrapEl.clientWidth);
		const h = Math.floor(wrapEl.clientHeight);
		if (w < MIN_CELLS * CELL_PX || h < MIN_CELLS * CELL_PX) return;

		let nextCols = Math.max(MIN_CELLS, Math.floor(w / CELL_PX));
		let nextRows = Math.max(MIN_CELLS, Math.floor(h / CELL_PX));

		if (nextCols * nextRows > MAX_CELLS) {
			const scale = Math.sqrt(MAX_CELLS / (nextCols * nextRows));
			nextCols = Math.max(MIN_CELLS, Math.floor(nextCols * scale));
			nextRows = Math.max(MIN_CELLS, Math.floor(nextRows * scale));
		}

		const sameSize = nextCols === cols && nextRows === rows;
		if (sameSize && population(current) > 0) return;

		cols = nextCols;
		rows = nextRows;
		next = new Uint8Array(cols * rows);
		imageData = null;
		seedGrid();

		canvasEl.width = cols;
		canvasEl.height = rows;
		draw();
	}

	function scheduleLayout() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(applyLayout, 150);
	}

	function loop(time: number) {
		frameId = requestAnimationFrame(loop);

		if (document.hidden) return;
		if (time - lastTick < TICK_MS) return;

		lastTick = time;
		step();
	}

	$effect(() => {
		if (!browser || !wrapEl || !canvasEl) return;

		applyLayout();

		// První mount: layout někdy ještě nemá rozměry — znovu nasadit náhodnou populaci.
		const seedWhenReady = requestAnimationFrame(() => {
			if (cols === 0 || population(current) === 0) {
				applyLayout();
			}
		});

		const observer = new ResizeObserver(scheduleLayout);
		observer.observe(wrapEl);
		frameId = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(seedWhenReady);
			observer.disconnect();
			cancelAnimationFrame(frameId);
			clearTimeout(resizeTimer);
		};
	});

	onDestroy(() => {
		if (!browser) return;
		cancelAnimationFrame(frameId);
		clearTimeout(resizeTimer);
	});
</script>

<div
	bind:this={wrapEl}
	class="relative h-full min-h-[220px] w-full cursor-pointer"
	role="button"
	tabindex="0"
	title="Klikni pro nové rozložení"
	aria-label="Game of Life — klikni pro reset"
	onclick={reset}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			reset();
		}
	}}
>
	<canvas
		bind:this={canvasEl}
		class="pointer-events-none block h-full w-full [image-rendering:pixelated]"
		aria-hidden="true"
	></canvas>
	<span
		class="pointer-events-none absolute right-3 bottom-3 font-mono text-[11px] tabular-nums tracking-wide text-black [text-shadow:0_0_14px_#fff,0_0_8px_#fff,0_0_3px_#fff,0_1px_0_#faf8f4]"
		aria-hidden="true"
	>
		{liveCount}
	</span>
</div>
