<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { contactChannels, contactIntro, contactMeta } from '$lib/data/contact';
</script>

<svelte:head>
	<title>{contactMeta.title}</title>
	<meta name="description" content={contactMeta.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">{contactIntro.title}</p>

			<p class="page-lead mb-6 max-w-2xl whitespace-normal">{contactIntro.lead}</p>

			<p class="mb-12 max-w-xl text-[15px] leading-[1.65] text-black/75">{contactIntro.note}</p>

			<ul>
				{#each contactChannels as channel, i}
					<li class:border-b-0={i === contactChannels.length - 1} class="border-b border-line">
						{#if channel.href}
							<a
								href={channel.href}
								class="grid gap-1 py-5 no-underline hover:underline sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-6"
								target={channel.external ? '_blank' : undefined}
								rel={channel.external ? 'noopener noreferrer' : undefined}
							>
								<span class="font-mono text-[11px] tracking-wide uppercase">{channel.label}</span>
								<span class="text-[15px]">{channel.value}</span>
							</a>
						{:else}
							<div
								class="grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-6"
							>
								<span class="font-mono text-[11px] tracking-wide uppercase">{channel.label}</span>
								<span class="text-[15px] text-black/50">{channel.value}</span>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	</main>

	<Footer />
</div>
