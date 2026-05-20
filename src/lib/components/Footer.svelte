<script lang="ts">
	import { footerLinks, siteMeta } from '$lib/data/placeholder';
</script>

<footer class="border-t border-line">
	<div class="grid items-center gap-4 px-8 py-5 font-mono text-[13px] lg:grid-cols-[1fr_auto_1fr]">
		<a href="/" class="flex items-center gap-2 no-underline hover:opacity-75 lg:justify-self-start">
			<img src="/logo.svg" alt="Heterarchy" class="h-5 w-auto" />
			<span class="font-mono text-[13px]">{siteMeta.footerNotice}</span>
		</a>
		<nav class="flex flex-wrap items-center justify-center gap-x-1.5 lg:justify-self-center">
			{#each footerLinks as link, i}
				{#if i > 0}<span aria-hidden="true">·</span>{/if}
				<a
					href={link.href}
					class="no-underline hover:underline"
					target={link.href.startsWith('http') ? '_blank' : undefined}
					rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
				>
					{link.label}
				</a>
			{/each}
		</nav>
		<a
			href={siteMeta.sourceHref}
			class="no-underline hover:underline lg:justify-self-end"
			target="_blank"
			rel="noopener noreferrer"
		>
			verze {siteMeta.version}
		</a>
	</div>
</footer>
