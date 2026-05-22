<script lang="ts">
	import { siteMeta } from '$lib/data/placeholder';
	import { localizeUrl } from '$lib/i18n';
	import * as m from '$lib/paraglide/messages';
</script>

<footer class="border-t border-line">
	<div class="grid items-center gap-4 px-8 py-5 font-mono text-[13px] lg:grid-cols-[1fr_auto_1fr]">
		<a href={localizeUrl('/')} class="flex items-center gap-2 no-underline hover:opacity-75 lg:justify-self-start">
			<img src="/logo.svg" alt="Heterarchy" class="h-5 w-auto" />
			<span class="font-mono text-[13px]">{siteMeta.footerNotice}</span>
		</a>
		<nav class="flex flex-wrap items-center justify-center gap-x-1.5 lg:justify-self-center">
			<a href={localizeUrl('/find-us')} class="no-underline hover:underline">{m.footer_where_to_find()}</a>
			<span aria-hidden="true">·</span>
			<a href={siteMeta.sourceHref} class="link-external" target="_blank" rel="noopener noreferrer">{m.footer_git()}</a>
		</nav>
		<a
			href={siteMeta.sourceHref}
			class="link-external lg:justify-self-end"
			target="_blank"
			rel="noopener noreferrer"
		>
			{m.footer_version({ version: siteMeta.version })}
		</a>
	</div>
</footer>
