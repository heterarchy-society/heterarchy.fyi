<script lang="ts">
	type Variant = 'default' | 'compact';

	let {
		href,
		name,
		avatarUrl = null,
		avatarSrcset = undefined,
		avatarAltUrl = null,
		avatarAltSrcset = undefined,
		avatarAlt = name,
		subtitle = null,
		sizes,
		variant = 'default'
	}: {
		href: string;
		name: string;
		avatarUrl?: string | null;
		avatarSrcset?: string;
		avatarAltUrl?: string | null;
		avatarAltSrcset?: string;
		avatarAlt?: string;
		subtitle?: string | null;
		sizes: string;
		variant?: Variant;
	} = $props();

	let altLoaded = $state(false);
	const compact = $derived(variant === 'compact');
</script>

<a
	{href}
	class="group block min-w-0 no-underline"
	aria-label={name}
	onmouseenter={() => (altLoaded = true)}
>
	<article>
		{#if avatarUrl}
			<div class="relative aspect-square w-full">
				<img
					src={avatarUrl}
					srcset={avatarSrcset}
					{sizes}
					alt={avatarAlt}
					class="absolute inset-0 h-full w-full border border-line object-cover transition-opacity duration-300 {avatarAltUrl ? 'group-hover:opacity-0' : 'group-hover:opacity-85'}"
					loading="lazy"
					decoding="async"
				/>
				{#if avatarAltUrl}
					<img
						src={altLoaded ? avatarAltUrl : undefined}
						srcset={altLoaded ? avatarAltSrcset : undefined}
						{sizes}
						alt={avatarAlt}
						class="absolute inset-0 h-full w-full border border-line object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					/>
				{/if}
			</div>
		{:else}
			<div class="aspect-square w-full border border-line bg-bg-muted" aria-hidden="true"></div>
		{/if}

		<svelte:element
			this={compact ? 'h3' : 'h2'}
			class="{compact ? 'mt-2 text-[13px] text-black/75' : 'mt-3 text-[16px] text-black lg:text-[18px]'} break-words font-mono leading-tight underline decoration-transparent underline-offset-[3px] transition-colors [overflow-wrap:anywhere] group-hover:decoration-current"
		>
			{name}
		</svelte:element>
		{#if subtitle}
			<p class="{compact ? 'mt-1 text-[11px]' : 'mt-1 text-[13px]'} break-words font-mono leading-tight text-black/40 [overflow-wrap:anywhere]">
				{subtitle}
			</p>
		{/if}
	</article>
</a>
