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
	import type { JoinOption } from '$lib/data/join';

	let { option, index, total }: { option: JoinOption; index: number; total: number } =
		$props();

	const icons = {
		meeting: Calendar,
		event: CalendarPlus,
		online: MessagesSquare,
		write: FileText,
		book: BookOpen,
		space: MapPin,
		fork: GitFork
	} as const;

	const Icon = icons[option.icon];

	const spansFull = index === total - 1 && total % 2 !== 0;
	const row = Math.floor(index / 2);
	const totalRows = Math.ceil(total / 2);
</script>

<article
	class="flex h-full flex-col border-line p-7 lg:p-8"
	class:border-b={index < total - 1}
	class:sm:border-r={index % 2 === 0 && !spansFull}
	class:sm:border-b={row < totalRows - 1}
	class:sm:col-span-2={spansFull}
>
	<Icon size={28} strokeWidth={1.25} class="mb-6 text-black/80" />

	<h2 class="mb-3 font-mono text-[11px] tracking-wide uppercase">{option.label}</h2>

	<p class="mb-6 flex-1 text-[15px] leading-[1.65]">{option.description}</p>

	<a
		href={option.href}
		class="link-arrow mt-auto text-[13px]"
		target={option.external ? '_blank' : undefined}
		rel={option.external ? 'noopener noreferrer' : undefined}
	>
		{option.linkLabel}
	</a>
</article>
