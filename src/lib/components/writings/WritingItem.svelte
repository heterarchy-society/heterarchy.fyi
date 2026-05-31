<script lang="ts">
	import { localizeUrl } from '$lib/i18n';
	import { writingAuthorRefs, writingExcerpt, writingReadingMinutes } from '$lib/data/writings';
	import { personAvatarUrl } from '$lib/data/people';
	import * as m from '$lib/paraglide/messages';
	import { Headphones } from 'lucide-svelte';

	type WritingLike = {
		id: string;
		title: string;
		authors: string[];
		year: number | null;
		type?: string;
		description?: string;
		audio?: { duration?: string }[];
		sources?: { path: string; format: string; generated_from?: string }[];
		_assets?: Record<string, { text?: { words?: number } }>;
	};

	let {
		writing,
		variant = 'full',
		class: className = ''
	}: { writing: WritingLike; variant?: 'full' | 'compact'; class?: string } = $props();

	const authors = $derived(writingAuthorRefs(writing.authors));
	const excerpt = $derived(writingExcerpt(writing as Parameters<typeof writingExcerpt>[0]));

	const minutes = $derived(writingReadingMinutes(writing));

	const metaText = $derived(
		[
			authors.map((a) => a.person?.name ?? a.name).join(', '),
			writing.year ?? undefined,
			minutes !== null ? m.writings_read_time({ count: String(minutes) }) : undefined
		]
			.filter(Boolean)
			.join(' · ')
	);

	// Variant-only differences: text size, avatar size, width.
	const avatarClass = $derived(variant === 'full' ? 'size-[18px]' : 'size-5');
	const avatarPx = $derived(variant === 'full' ? 18 : 20);
	const titleClass = $derived(variant === 'full' ? 'text-[20px] mb-3' : 'text-[19px]');
	const descClass = $derived(variant === 'full' ? 'text-[14px] text-black/60' : 'mt-2 text-[13px] text-black/50');
</script>

<a href={localizeUrl(`/writings/${writing.id}`)} class="group block no-underline {className}">
	<div class="max-w-2xl">
		<div class="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black/35">
			{#each authors as author}
				{#if author.person}
					{@const avatarUrl = personAvatarUrl(author.person)}
					{#if avatarUrl}
						<img
							src={avatarUrl}
							alt={author.person.name}
							width={avatarPx}
							height={avatarPx}
							class="{avatarClass} shrink-0 border border-line object-cover"
						/>
					{/if}
				{/if}
			{/each}
			<span class="inline-flex items-center gap-1.5">
				<span>{metaText}</span>{#if writing.audio?.length}<span class="text-black/25">·</span><span class="inline-flex items-center gap-1"><Headphones size={11} strokeWidth={1.8} />{#if writing.audio[0].duration}{writing.audio[0].duration}{/if}</span>{/if}
			</span>
		</div>
		<h2 class="{titleClass} font-mono leading-snug text-black underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
			{writing.title}
		</h2>
		{#if excerpt}
			<p class="{descClass} leading-[1.65]">{excerpt}</p>
		{/if}
	</div>
</a>
