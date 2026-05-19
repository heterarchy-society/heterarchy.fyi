<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { LUMA_AI_SVOBODA } from '$lib/data/events';
	import { contactChannels, contactIntro, contactMeta } from '$lib/data/contact';
</script>

<svelte:head>
	<title>{contactMeta.title}</title>
	<meta name="description" content={contactMeta.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy max-w-3xl">
			<p class="label">{contactIntro.title}</p>

			<h1 class="mb-6 max-w-2xl text-[1.75rem] leading-[1.25] font-semibold tracking-[-0.02em] lg:text-[2rem]">
				{contactIntro.lead}
			</h1>

			<p class="mb-12 max-w-xl text-[15px] leading-[1.65] text-black/75">{contactIntro.note}</p>

			<ul class="mb-12">
				{#each contactChannels as channel, i}
					<li class:border-b-0={i === contactChannels.length - 1} class="border-b border-line">
						<a
							href={channel.href}
							class="grid gap-1 py-5 no-underline hover:underline sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-6"
							target={channel.external ? '_blank' : undefined}
							rel={channel.external ? 'noopener noreferrer' : undefined}
						>
							<span class="font-mono text-[11px] tracking-wide uppercase">{channel.label}</span>
							<span class="text-[15px]">{channel.value}</span>
						</a>
					</li>
				{/each}
			</ul>

			<a
				href={LUMA_AI_SVOBODA}
				class="link-arrow text-[13px]"
				target="_blank"
				rel="noopener noreferrer"
			>
				→ nejbližší setkání
			</a>
		</section>
	</main>

	<Footer />
</div>
