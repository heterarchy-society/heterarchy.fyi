<script lang="ts">
	import { values } from '$lib/data/about';
	import ValueIcon from './ValueIcon.svelte';
</script>

<section class="bg-bg-muted">
	<div class="grid grid-cols-1 gap-12 px-8 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:px-10 lg:py-16">
		{#each values as value}
			<div class="flex flex-col gap-5">
				<ValueIcon icon={value.icon} />
				<div class="flex flex-col gap-2">
					<h2 class="text-[15px] font-semibold tracking-[-0.01em]">{value.title}</h2>
					<p class="text-[14px] leading-[1.6] text-black/75">{value.description}</p>
				</div>
			</div>
		{/each}
	</div>
</section>
