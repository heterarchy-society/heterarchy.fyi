<script lang="ts">
	const nodes = [
		{ x: 45, y: 55, r: 3 },
		{ x: 95, y: 35, r: 2 },
		{ x: 155, y: 48, r: 4 },
		{ x: 220, y: 30, r: 2.5 },
		{ x: 280, y: 60, r: 3 },
		{ x: 70, y: 120, r: 2 },
		{ x: 140, y: 105, r: 3.5 },
		{ x: 210, y: 115, r: 2 },
		{ x: 265, y: 130, r: 3 },
		{ x: 35, y: 185, r: 2.5 },
		{ x: 110, y: 175, r: 2 },
		{ x: 185, y: 190, r: 4 },
		{ x: 250, y: 200, r: 2 },
		{ x: 300, y: 170, r: 3 },
		{ x: 55, y: 250, r: 2 },
		{ x: 165, y: 260, r: 3 },
		{ x: 235, y: 245, r: 2.5 }
	];

	const edges: [number, number][] = [
		[0, 1],
		[1, 2],
		[2, 4],
		[0, 5],
		[5, 6],
		[6, 7],
		[7, 8],
		[6, 11],
		[11, 12],
		[12, 13],
		[9, 10],
		[10, 11],
		[11, 15],
		[14, 15],
		[15, 16]
	];
</script>

<div class="text-line flex items-center justify-center py-8 lg:py-12">
	<svg viewBox="0 0 340 290" class="h-auto w-full max-w-[380px]" aria-hidden="true">
		{#each edges as [from, to]}
			<line
				x1={nodes[from].x}
				y1={nodes[from].y}
				x2={nodes[to].x}
				y2={nodes[to].y}
				stroke="currentColor"
				stroke-width="1"
			/>
		{/each}
		{#each nodes as node}
			<circle cx={node.x} cy={node.y} r={node.r} fill="currentColor" />
		{/each}
	</svg>
</div>
