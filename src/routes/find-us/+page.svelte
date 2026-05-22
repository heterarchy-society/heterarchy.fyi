<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onlineChannels, offlineVenues, contactMeta } from '$lib/data/contact';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.find_us_label()} — The Heterarchy Society</title>
	<meta name="description" content={contactMeta.description} />
</svelte:head>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section class="cell-roomy">
			<p class="label">{m.find_us_label()}</p>

			<p class="page-lead mb-6">{m.find_us_lead()}</p>

			<div class="flex flex-col gap-12">
				<div>
					<p class="font-mono text-[11px] tracking-wide uppercase mb-4 text-black/50">{m.find_us_online()}</p>
					<ul>
						{#each onlineChannels as channel, i}
							<li class:border-b-0={i === onlineChannels.length - 1} class="border-b border-line">
								<a
									href={channel.href}
									class="grid gap-1 py-5 no-underline hover:underline sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-6"
									target={channel.external ? '_blank' : undefined}
									rel={channel.external ? 'noopener noreferrer' : undefined}
								>
									<span class="font-mono text-[11px] tracking-wide uppercase">{channel.label}</span>
									<span class={channel.external ? 'link-external text-[15px]' : 'text-[15px]'}>{channel.value}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<p class="font-mono text-[11px] tracking-wide uppercase mb-4 text-black/50">{m.find_us_offline()}</p>
					<p class="mb-4 max-w-xl text-[15px] leading-[1.65] text-black/75">{m.find_us_offline_intro()}</p>
					<ul>
						{#each offlineVenues as venue, i}
							<li class:border-b-0={i === offlineVenues.length - 1} class="border-b border-line">
								<a
									href={venue.href}
									class="grid gap-1 py-5 no-underline hover:underline sm:grid-cols-[8rem_1fr] sm:items-center sm:gap-6"
									target={venue.external ? '_blank' : undefined}
									rel={venue.external ? 'noopener noreferrer' : undefined}
								>
									<span class="font-mono text-[11px] tracking-wide uppercase">{venue.label}</span>
									<span class="flex min-w-0 items-center gap-4">
										<span class="min-w-0">
											<span class={venue.external ? 'link-external block text-[15px]' : 'block text-[15px]'}>{venue.value}</span>
											<span class="mt-1 block font-mono text-[11px] text-black/60">
												{venue.city}, {venue.country}
											</span>
										</span>
										{#if venue.logo}
											<img
												src={venue.logo}
												alt={venue.label}
												class="h-7 w-auto shrink-0 object-contain mix-blend-multiply"
											/>
										{/if}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
