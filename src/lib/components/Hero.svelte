<script lang="ts">
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';

	const ctas = $derived([
		{ label: m.hero_cta_concept(), href: localizeUrl('/about') },
		{ label: m.hero_cta_join(), href: localizeUrl('/join') },
	]);
</script>

<div class="flex flex-col gap-10">
	<p class="max-w-130 text-[1.5rem] leading-[1.4] tracking-[-0.01em] lg:text-[1.625rem]">
		{m.hero_tagline()}
	</p>
	<div class="flex flex-col gap-2 text-[13px]">
		{#each ctas as cta}
			<a href={cta.href} class="link-arrow w-fit">
				→ {cta.label}
			</a>
		{/each}
	</div>
</div>
