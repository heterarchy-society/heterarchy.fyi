<script lang="ts">
	import {
		BookOpen,
		Calendar,
		CalendarPlus,
		FileText,
		GitFork,
		MapPin,
		MessagesSquare
	} from 'lucide-svelte';
	import { localizeUrl } from '$lib/i18n';
	import type { JoinOption } from '$lib/data/join';
	import * as m from '$lib/paraglide/messages';

	let { option, index, total }: { option: JoinOption; index: number; total: number } = $props();

	const icons = {
		meeting: Calendar,
		event: CalendarPlus,
		online: MessagesSquare,
		write: FileText,
		book: BookOpen,
		space: MapPin,
		fork: GitFork
	} as const;

	const labels: Record<JoinOption['key'], () => { label: string; desc: string; link: string }> = {
		attend: () => ({ label: m.join_attend_label(), desc: m.join_attend_desc(), link: m.join_attend_link() }),
		event:  () => ({ label: m.join_event_label(),  desc: m.join_event_desc(),  link: m.join_event_link() }),
		online: () => ({ label: m.join_online_label(), desc: m.join_online_desc(), link: m.join_online_link() }),
		write:  () => ({ label: m.join_write_label(),  desc: m.join_write_desc(),  link: m.join_write_link() }),
		books:  () => ({ label: m.join_books_label(),  desc: m.join_books_desc(),  link: m.join_books_link() }),
		space:  () => ({ label: m.join_space_label(),  desc: m.join_space_desc(),  link: m.join_space_link() }),
		fork:   () => ({ label: m.join_fork_label(),   desc: m.join_fork_desc(),   link: m.join_fork_link() }),
	};

	const Icon = $derived(icons[option.icon]);
	const content = $derived(labels[option.key]());
	const href = $derived(option.external ? option.href : localizeUrl(option.href));

	const spansFull = $derived(index === total - 1 && total % 2 !== 0);
	const row = $derived(Math.floor(index / 2));
	const totalRows = $derived(Math.ceil(total / 2));
</script>

<article
	class="flex h-full flex-col border-line p-7 lg:p-8"
	class:border-b={index < total - 1}
	class:sm:border-r={index % 2 === 0 && !spansFull}
	class:sm:border-b={row < totalRows - 1}
	class:sm:col-span-2={spansFull}
>
	<Icon size={28} strokeWidth={1.25} class="mb-6 text-black/80" />

	<h2 class="mb-3 font-mono text-[11px] tracking-wide uppercase">{content.label}</h2>

	<p class="mb-6 flex-1 text-[15px] leading-[1.65]">{content.desc}</p>

	<a
		{href}
		class={option.external ? 'link-external mt-auto font-mono text-[13px]' : 'link-arrow mt-auto text-[13px]'}
		target={option.external ? '_blank' : undefined}
		rel={option.external ? 'noopener noreferrer' : undefined}
	>
		{content.link}
	</a>
</article>
