<script lang="ts">
	import { partners } from '$lib/data/partners';
</script>

<section>
	<p class="label">Přátelé</p>

	<ul class="mt-4 flex flex-col gap-2">
		{#each partners as partner}
			<li>
				<a href={partner.href} target="_blank" rel="noopener noreferrer" class="link-external font-mono text-[13px]">
					{partner.name}
				</a>
			</li>
		{/each}
	</ul>
</section>
