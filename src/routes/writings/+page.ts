export type Writing = {
	id: string;
	title: string;
	authors: string[];
	year: number | null;
	language: string;
	type: string;
	glossary: string[];
	sources: { path: string; format: string; variant?: string; generated_from?: string }[];
	audio?: { url: string; duration?: string; peaks?: string; transcript?: string }[];
	_assets?: Record<string, { size: number; hash: string; mime: string }>;
	references: { url: string; role: string }[];
	license: string | null;
	description: string;
	history?: { hash: string; date: string; author: string; message: string }[];
};

export type ChangelogEntry = {
	hash: string;
	date: string;
	author: string;
	message: string;
};

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	const [indexRes, changelogRes] = await Promise.allSettled([
		fetch('https://writings.data.heterarchy.fyi/'),
		fetch('https://writings.data.heterarchy.fyi/changelog.json'),
	]);

	const raw: Writing[] =
		indexRes.status === 'fulfilled' && indexRes.value.ok
			? ((await indexRes.value.json()).writings ?? [])
			: [];

	const writings = [...raw].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

	const changelog: ChangelogEntry[] =
		changelogRes.status === 'fulfilled' && changelogRes.value.ok
			? await changelogRes.value.json()
			: [];

	return { writings, changelog };
}
