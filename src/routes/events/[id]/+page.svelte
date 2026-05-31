<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import TalkGrid from '$lib/components/talks/TalkGrid.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { localizeUrl } from '$lib/i18n';
	import { eventPrimaryHref, isUpcomingEvent, eventEndDate } from '$lib/data/events';
	import { peopleById, personAvatarUrl, personAvatarAltUrl, imageSrcset } from '$lib/data/people';
	import PersonTile from '$lib/components/people/PersonTile.svelte';
	import EventDaysLeft from '$lib/components/events/EventDaysLeft.svelte';
	import DatasetRevision from '$lib/components/DatasetRevision.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const event = $derived(data.event);
	const primaryHref = $derived(eventPrimaryHref(event));

	function refHref(kind: string, value: string): string {
		if (/^https?:\/\//.test(value)) return value;
		if (kind === 'luma') return `https://lu.ma/${value}`;
		return value;
	}

	function refLabel(kind: string, value: string): string {
		if (kind === 'web') {
			try {
				return new URL(value).hostname.replace(/^www\./, '');
			} catch {
				return 'web';
			}
		}
		if (kind === 'luma') return 'Luma';
		if (kind === 'meetup') return 'Meetup';
		return kind.replace(/_/g, ' ');
	}

	const refEntries = $derived(
		Object.entries(event.refs ?? {}).filter(
			(entry): entry is [string, string] => Boolean(entry[1]) && entry[0] !== 'meetup_id'
		)
	);

	type OrganizerEntry =
		| string
		| {
			id?: string;
			person?: string;
			name?: string;
			label?: string;
			role?: string;
			roles?: string[] | string;
		};

	function organizerName(entry: OrganizerEntry): string {
		if (typeof entry === 'string') return entry;
		return entry.name ?? entry.label ?? entry.person ?? entry.id ?? '';
	}

	function organizerRole(entry: OrganizerEntry): string | null {
		if (typeof entry === 'string') return null;
		if (Array.isArray(entry.roles)) return entry.roles.join(', ');
		return entry.roles ?? entry.role ?? null;
	}

	function organizerPersonId(entry: OrganizerEntry): string | null {
		const raw = typeof entry === 'string' ? entry : (entry.person ?? entry.id ?? entry.name ?? entry.label);
		if (!raw) return null;
		const slug = raw.toLowerCase().replace(/\s+/g, '-');
		if (peopleById.has(slug)) return slug;
		if (peopleById.has(raw)) return raw;
		return null;
	}

	const organizers = $derived(
		((event.organizers ?? []) as OrganizerEntry[])
			.map((entry) => {
				const personId = organizerPersonId(entry);
				const person = personId ? peopleById.get(personId) : null;
				const name = person?.name ?? organizerName(entry);
				return { entry, person, personId, name, role: organizerRole(entry) };
			})
			.filter((organizer) => organizer.name)
	);

	const hasExtra = $derived(
		!!data.descriptionHtml ||
		data.speakers.length > 0 ||
		organizers.length > 0 ||
		!!event.aftermovie ||
		data.talks.length > 0
	);

	const isBanner = $derived(event.heroImageType === 'banner');
	const sideImageUrl = $derived(isBanner ? event.cardImageUrl : (event.heroImageUrl ?? event.cardImageUrl));
	const sideImageSrcset = $derived(isBanner ? event.cardImageSrcset : (event.heroImageSrcset ?? event.cardImageSrcset));
	const linkedSpeakers = $derived(data.speakers.filter((speaker) => speaker.type === 'person'));
	const textSpeakers = $derived(data.speakers.filter((speaker) => speaker.type === 'text'));

	const timeAgo = $derived((): string | null => {
		if (isUpcomingEvent(event)) return null;
		const end = eventEndDate(event) ?? event.date;
		const days = Math.floor((Date.now() - new Date(end + 'T12:00:00').getTime()) / 86400000);
		if (days < 1) return null;
		if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
		const months = Math.floor(days / 30.44);
		if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
		const years = Math.floor(days / 365.25);
		return `${years} year${years === 1 ? '' : 's'} ago`;
	});
</script>

<svelte:head>
	<title>{event.name} — {m.events_label()}</title>
	<meta name="description" content={event.caption ?? event.description?.slice(0, 160) ?? m.events_page_lead()} />
</svelte:head>

<Seo
	title="{event.name} — {m.events_label()}"
	description={event.caption ?? event.description?.slice(0, 160) ?? m.events_page_lead()}
	image={event.heroImageUrl ?? event.cardImageUrl}
/>

<div class="min-h-screen w-full">
	<Header />

	<main>
		<section>
<div class="cell-roomy">
			<div class="grid gap-12 lg:grid-cols-[1fr_240px] lg:gap-16">
			<div
				class="grid min-w-0 gap-10 lg:gap-14"
				class:lg:grid-cols-[minmax(180px,240px)_1fr]={!!sideImageUrl}
			>
				{#if sideImageUrl}
					<div class="mx-auto w-full max-w-60 lg:mx-0">
						<img
							src={sideImageUrl}
							srcset={sideImageSrcset}
							sizes="(min-width: 1024px) 240px, 60vw"
							alt={event.name}
							class="w-full border border-line"
						/>
					</div>
				{/if}

				<div class="min-w-0">
					<a href={localizeUrl('/events')} class="label mb-4 inline-block no-underline hover:underline">
						{m.events_detail_back()}
					</a>

					<p class="mb-2 font-mono text-[13px] leading-snug text-black/50">
						{event.dateLabelLong}
						{#if isUpcomingEvent(event)}
							{' '}<EventDaysLeft {event} />
						{:else if timeAgo()}
							<span class="text-black/35">({timeAgo()})</span>
						{/if}
					</p>
					<h1 class="book-detail-title mb-4 max-w-2xl">{event.name}</h1>

					{#if event.caption}
						<p class="mb-6 max-w-2xl text-[15px] leading-[1.65] text-black/65">{event.caption}</p>
					{/if}

					<ul class="mb-6 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[12px] text-black/45">
						{#if event.timeLabel}
							<li>{event.timeLabel}</li>
						{/if}
						{#if event.locationLabel}
							<li>{event.locationLabel}</li>
						{/if}
						{#if event.langs?.length}
							<li>{event.langs.join(', ')}</li>
						{/if}
					</ul>

					{#if refEntries.length > 0}
						<ul class="flex flex-wrap gap-x-5 gap-y-2">
							{#each refEntries as [kind, value]}
								<li>
									<a
										href={refHref(kind, value)}
										class="link-external font-mono text-[13px]"
										target="_blank"
										rel="noopener noreferrer"
									>
										{refLabel(kind, value)}
									</a>
								</li>
							{/each}
						</ul>
					{:else if primaryHref}
						<a
							href={primaryHref}
							class="link-external font-mono text-[13px]"
							target="_blank"
							rel="noopener noreferrer"
						>
							{m.featured_event_detail()}
						</a>
					{/if}
				</div>
			</div>

			<DatasetRevision history={event.history ?? []} repository={data.repository} path="events/{event.id}" />
			</div>
			</div>
		</section>

		{#if hasExtra}
			<section class="cell-roomy">
				{#if data.descriptionHtml}
					<div class="mb-10 max-w-2xl">
						<p class="label mb-4">{m.events_detail_about()}</p>
						<div
							class="text-[15px] leading-[1.7] text-black/80 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-line [&_a:hover]:decoration-black/60 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic"
						>
							{@html data.descriptionHtml}
						</div>
					</div>
				{/if}

				{#if data.speakers.length > 0}
					<div class="mb-10">
						<p class="label mb-4">{m.events_detail_speakers()}</p>
						{#if linkedSpeakers.length > 0}
							<div class="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9">
								{#each linkedSpeakers as speaker}
									{@const person = peopleById.get(speaker.id)}
									<PersonTile
										href={localizeUrl(`/people/${speaker.id}`)}
										name={speaker.name}
										avatarUrl={person ? personAvatarUrl(person) : null}
										avatarSrcset={person ? imageSrcset(person.avatarVersions) : undefined}
										avatarAltUrl={person ? personAvatarAltUrl(person) : null}
										avatarAltSrcset={person ? imageSrcset(person.avatarsAltVersions?.[0] ?? undefined) : undefined}
										sizes="(min-width: 1280px) 80px, (min-width: 1024px) 10vw, (min-width: 640px) 20vw, 30vw"
										variant="compact"
									/>
								{/each}
							</div>
						{/if}

						{#if textSpeakers.length > 0}
							<p class="flex max-w-4xl flex-wrap gap-x-5 gap-y-2 font-mono text-[13px] leading-relaxed text-black/55 {linkedSpeakers.length > 0 ? 'mt-7' : ''}">
								{#each textSpeakers as speaker, i}
									<span>{speaker.label}</span>
								{/each}
							</p>
						{/if}
					</div>
				{/if}

				{#if organizers.length > 0}
					<div class="mb-10">
						<p class="label mb-4">{m.events_detail_organizers()}</p>
						<div class="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9">
							{#each organizers as organizer}
								{#if organizer.personId}
									<PersonTile
										href={localizeUrl(`/people/${organizer.personId}`)}
										name={organizer.name}
										subtitle={organizer.role}
										avatarUrl={organizer.person ? personAvatarUrl(organizer.person) : null}
										avatarSrcset={organizer.person ? imageSrcset(organizer.person.avatarVersions) : undefined}
										avatarAltUrl={organizer.person ? personAvatarAltUrl(organizer.person) : null}
										avatarAltSrcset={organizer.person ? imageSrcset(organizer.person.avatarsAltVersions?.[0] ?? undefined) : undefined}
										sizes="(min-width: 1280px) 80px, (min-width: 1024px) 10vw, (min-width: 640px) 20vw, 30vw"
										variant="compact"
									/>
								{:else}
									<div class="min-w-0">
										<div class="aspect-square w-full border border-line bg-bg-muted" aria-hidden="true"></div>
										<h3 class="mt-2 break-words font-mono text-[13px] leading-tight text-black/75 [overflow-wrap:anywhere]">
											{organizer.name}
										</h3>
										{#if organizer.role}
											<p class="mt-1 break-words font-mono text-[11px] leading-tight text-black/40 [overflow-wrap:anywhere]">
												{organizer.role}
											</p>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				{#if event.aftermovie}
					<div class="mb-10">
						<p class="label mb-4">{m.events_detail_aftermovie()}</p>
						<div class="aspect-video max-w-3xl overflow-hidden border border-line">
							<iframe
								title={event.name}
								src="https://www.youtube-nocookie.com/embed/{event.aftermovie}?rel=0&modestbranding=1"
								class="h-full w-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					</div>
				{/if}

				{#if data.talks.length > 0}
					<div class="mb-10 border-t border-line pt-10">
						<p class="label mb-4">{m.events_detail_talks()}</p>
						<TalkGrid talks={data.talks} />
					</div>
				{/if}
			</section>
		{/if}
	</main>

	<Footer />
</div>
