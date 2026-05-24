export type Writing = {
	id: string;
	title: string;
	authors: string[];
	year: number | null;
	language: string;
	type: string;
	glossary: string[];
	sources: { path: string; format: string }[];
	references: { url: string; role: string }[];
	license: string | null;
	description: string;
	history?: { hash: string; date: string; author: string; message: string }[];
};

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	try {
		const res = await fetch('https://writings.data.heterarchy.fyi/');
		const data = await res.json();
		return { writings: (data.writings ?? []) as Writing[] };
	} catch {
		return { writings: [] as Writing[] };
	}
}
