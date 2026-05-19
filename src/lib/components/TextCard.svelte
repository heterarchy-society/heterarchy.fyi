<script lang="ts">
	import type { TextArticle } from '$lib/data/placeholder';

	let { article }: { article: TextArticle } = $props();
</script>

<article class="flex min-h-[210px] flex-col px-0 py-1 lg:min-h-[220px] lg:px-5">
	<p class="mb-5 font-mono text-[11px]">{article.category} · {article.date}</p>

	<h3 class="mb-4 text-[15px] leading-[1.35] font-semibold tracking-[-0.01em]">{article.title}</h3>

	<p class="mb-6 flex-1 text-[13px] leading-[1.55]">{article.excerpt}</p>

	<a href={article.href} class="link-arrow text-[12px]">číst dál →</a>
</article>
