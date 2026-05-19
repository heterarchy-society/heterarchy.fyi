<script lang="ts">
	const rows = [
		[
			{ x: 70, y: 35 },
			{ x: 140, y: 20 },
			{ x: 210, y: 30 },
			{ x: 280, y: 45 }
		],
		[
			{ x: 50, y: 85 },
			{ x: 125, y: 75 },
			{ x: 205, y: 80 },
			{ x: 285, y: 95 }
		],
		[
			{ x: 35, y: 140 },
			{ x: 115, y: 135 },
			{ x: 200, y: 140 },
			{ x: 280, y: 150 }
		],
		[
			{ x: 25, y: 200 },
			{ x: 105, y: 210 },
			{ x: 195, y: 205 },
			{ x: 275, y: 220 }
		],
		[
			{ x: 20, y: 260 },
			{ x: 100, y: 275 },
			{ x: 190, y: 265 },
			{ x: 270, y: 280 }
		]
	];

	const nodes = rows.flat();
</script>

<div class="flex h-full min-h-[300px] items-center justify-center lg:min-h-[340px]">
	<svg viewBox="0 0 310 300" class="h-auto w-full max-w-[320px]" aria-hidden="true">
		{#each rows as row, ri}
			{#each row as node, ci}
				{#if ci < row.length - 1}
					<line
						x1={node.x}
						y1={node.y}
						x2={row[ci + 1].x}
						y2={row[ci + 1].y}
						stroke="black"
						stroke-width="1"
					/>
				{/if}
				{#if ri < rows.length - 1}
					<line
						x1={node.x}
						y1={node.y}
						x2={rows[ri + 1][ci].x}
						y2={rows[ri + 1][ci].y}
						stroke="black"
						stroke-width="1"
					/>
				{/if}
			{/each}
		{/each}
		{#each nodes as node}
			<circle cx={node.x} cy={node.y} r="3" fill="black" />
		{/each}
	</svg>
</div>
