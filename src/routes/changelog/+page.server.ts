import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderMarkdown } from '$lib/server/markdown';
import { forgejoWebRepo } from '$lib/data/placeholder';

const CHANGELOG_DIR = resolve(process.cwd(), 'changelog');

function linkifyHashes(html: string): string {
	return html.replace(/\[([a-f0-9]{7,40}(?:,\s*[a-f0-9]{7,40})*)\]/g, (_, inner) => {
		const links = inner.split(/,\s*/).map((h: string) =>
			`<a href="${forgejoWebRepo}/commit/${h.trim()}" target="_blank" rel="noopener noreferrer">${h.trim()}</a>`
		);
		return `[${links.join(', ')}]`;
	});
}

function semverCompare(a: string, b: string): number {
	const parse = (s: string) => s.replace(/^v/, '').split('.').map(Number);
	const [aMaj, aMin, aPat] = parse(a);
	const [bMaj, bMin, bPat] = parse(b);
	return bMaj - aMaj || bMin - aMin || bPat - aPat;
}

export async function load() {
	const files = readdirSync(CHANGELOG_DIR)
		.filter((f) => f.endsWith('.md'))
		.map((f) => f.replace('.md', ''))
		.sort(semverCompare);

	const entries = await Promise.all(
		files.map(async (version) => {
			const raw = readFileSync(resolve(CHANGELOG_DIR, `${version}.md`), 'utf8');
			const html = linkifyHashes(await renderMarkdown(raw));
			return { version, html };
		})
	);

	return { entries };
}
