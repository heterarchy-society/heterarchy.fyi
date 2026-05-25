<script lang="ts">
	import { localizeUrl } from '$lib/i18n';
	import { bookAuthorRefs, bookAuthorText, type LibraryBook } from '$lib/data/library';
	import { personAvatarUrl, imageSrcset, personPath } from '$lib/data/people';

	let {
		book,
		linked = false,
		avatars = false,
		authorClass = ''
	}: { book: LibraryBook; linked?: boolean; avatars?: boolean; authorClass?: string } = $props();

	const authors = $derived(bookAuthorRefs(book));
</script>

{#if linked}
	<div class={authorClass}>
		<div class="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[13px] text-black/70">
			{#each authors as author}
				{#if author.person}
					<a
						href={localizeUrl(personPath(author.person.id))}
						class="group inline-flex items-center gap-2 text-inherit no-underline hover:text-black"
					>
						{#if avatars && personAvatarUrl(author.person)}
							<img
								src={personAvatarUrl(author.person) ?? ''}
								srcset={imageSrcset(author.person.avatarVersions)}
								sizes="32px"
								alt={author.person.name}
								width={32}
								height={32}
								class="size-8 border border-line object-cover"
							/>
						{/if}
						<span class="group-hover:underline">{author.name}</span>
					</a>
				{:else}
					<span>{author.name}</span>
				{/if}
			{/each}
		</div>
	</div>
{:else}
	<p class={authorClass}>{bookAuthorText(book)}</p>
{/if}
