/**
 * Check whether long-form content translations are up to date.
 *
 * For each source file in src/lib/content/*.md, compares its current hash
 * against the hash stored in src/lib/content/translations/{locale}/{name}.md.
 * Exits with code 1 if any translation is stale or missing.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, basename } from 'path';
import { hashContent, parseFrontmatter } from './content-hash.js';

const CONTENT_DIR = resolve('src/lib/content');
const TRANSLATIONS_DIR = resolve('src/lib/content/translations');
const LOCALES = ['cs'];

const sources = readdirSync(CONTENT_DIR)
	.filter((f) => f.endsWith('.md'))
	.map((f) => ({ name: basename(f, '.md'), path: resolve(CONTENT_DIR, f) }));

let stale = false;

for (const { name, path } of sources) {
	const source = readFileSync(path, 'utf8');
	const hash = hashContent(source);

	for (const locale of LOCALES) {
		const translationPath = resolve(TRANSLATIONS_DIR, locale, `${name}.md`);
		const displayPath = `translations/${locale}/${name}.md`;

		if (!existsSync(translationPath)) {
			console.error(`✗ MISSING  ${displayPath}`);
			stale = true;
			continue;
		}

		const translation = parseFrontmatter(readFileSync(translationPath, 'utf8'));

		if (!translation.hash) {
			console.error(`✗ NO HASH  ${displayPath}`);
			stale = true;
		} else if (translation.hash !== hash) {
			console.error(`✗ STALE    ${displayPath}  (stored: ${translation.hash}  current: ${hash})`);
			stale = true;
		} else {
			console.log(`✓ ok       ${displayPath}`);
		}
	}
}

if (stale) process.exit(1);
