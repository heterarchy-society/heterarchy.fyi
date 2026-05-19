<script lang="ts">
	import { navItems } from '$lib/data/placeholder';
</script>

<header class="border-b border-black">
	<div class="flex items-center justify-between px-8 py-5">
		<a href="/" class="font-mono no-underline hover:underline">heterarchy.cz</a>
		<nav class="flex flex-wrap items-center gap-x-8 font-mono text-[13px]">
			{#each navItems as item}
				<a href={item.href} class="no-underline hover:underline">{item.label}</a>
			{/each}
		</nav>
	</div>
</header>
