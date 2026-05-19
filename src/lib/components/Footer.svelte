<script lang="ts">
	import { footerLinks, siteMeta } from '$lib/data/placeholder';
</script>

<footer class="border-t border-line">
	<div class="grid items-center gap-4 px-8 py-5 font-mono text-[13px] lg:grid-cols-[1fr_auto_1fr]">
		<p class="lg:justify-self-start">{siteMeta.footerNotice}</p>
		<nav class="flex flex-wrap items-center justify-center gap-x-1.5 lg:justify-self-center">
			{#each footerLinks as link, i}
				{#if i > 0}<span aria-hidden="true">·</span>{/if}
				<a href={link.href} class="no-underline hover:underline">{link.label}</a>
			{/each}
		</nav>
		<p class="lg:justify-self-end">verze {siteMeta.version}</p>
	</div>
</footer>
