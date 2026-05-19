<script lang="ts">
	import { aboutHero } from '$lib/data/about';

	const isExternal = $derived(aboutHero.cta.href.startsWith('http'));
</script>

<div class="flex flex-col gap-10 lg:gap-12">
	<h1 class="max-w-xl text-[2rem] leading-[1.15] font-semibold tracking-[-0.02em] lg:text-[2.75rem]">
		{#each aboutHero.lines as line}
			<span class="block {line.muted ? 'text-black/45' : 'text-black'}">{line.text}</span>
		{/each}
	</h1>

	<p class="max-w-lg text-[15px] leading-[1.65] lg:text-base">{aboutHero.intro}</p>

	<a
		href={aboutHero.cta.href}
		class="link-arrow w-fit text-[13px]"
		target={isExternal ? '_blank' : undefined}
		rel={isExternal ? 'noopener noreferrer' : undefined}
	>
		→ {aboutHero.cta.label}
	</a>
</div>
