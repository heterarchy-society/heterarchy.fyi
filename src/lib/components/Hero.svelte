<script lang="ts">
	import { hero } from '$lib/data/placeholder';
</script>

<div class="flex min-h-[300px] flex-col justify-between lg:min-h-[340px]">
	<p class="max-w-[520px] text-[1.625rem] leading-[1.35] tracking-[-0.01em]">
		{hero.tagline}
	</p>
	<div class="flex flex-col gap-2 text-[13px]">
		{#each hero.ctas as cta}
			<a href={cta.href} class="link-arrow w-fit">→ {cta.label}</a>
		{/each}
	</div>
</div>
