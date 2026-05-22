import { createHash } from 'crypto';

/** Compute the 16-char hex hash used to fingerprint content files. */
export function hashContent(text) {
	return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/** Parse YAML frontmatter from a markdown string. Returns { hash, body }. */
export function parseFrontmatter(text) {
	const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { hash: null, body: text };
	const hash = match[1].match(/hash:\s*(\S+)/)?.[1] ?? null;
	const body = match[2].trimStart();
	return { hash, body };
}
