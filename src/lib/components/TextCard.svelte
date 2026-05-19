<script lang="ts">
	import type { TextArticle } from '$lib/data/placeholder';

	let { article, last = false }: { article: TextArticle; last?: boolean } = $props();
</script>

<a
	href={article.href}
	class="group block border-line py-8 no-underline lg:py-9"
	class:border-b={!last}
>
	<p class="mb-4 font-mono text-[11px]">{article.category} · {article.date}</p>

	<h3
		class="mb-4 max-w-3xl text-[17px] leading-[1.35] font-semibold tracking-[-0.01em] group-hover:underline lg:text-[18px]"
	>
		{article.title}
	</h3>

	<p class="mb-5 max-w-2xl text-[14px] leading-[1.65] text-black/80">{article.excerpt}</p>

	<span class="link-arrow text-[12px]">číst dál →</span>
</a>
