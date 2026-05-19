<script lang="ts">
	import { hero } from '$lib/data/placeholder';
</script>

<div class="flex flex-col gap-10">
	<p class="max-w-[520px] text-[1.5rem] leading-[1.4] tracking-[-0.01em] lg:text-[1.625rem]">
		{hero.tagline}
	</p>
	<div class="flex flex-col gap-2 text-[13px]">
		{#each hero.ctas as cta}
			<a
				href={cta.href}
				class="link-arrow w-fit"
				target={cta.href.startsWith('http') ? '_blank' : undefined}
				rel={cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
			>
				→ {cta.label}
			</a>
		{/each}
	</div>
</div>
