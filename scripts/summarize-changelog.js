/**
 * Generates a changelog entry for a given version using the Codex CLI.
 * Writes to changelog/v{version}.md.
 *
 * Usage: bun scripts/summarize-changelog.js <version> [from-tag]
 * Requires: codex CLI (https://github.com/openai/codex)
 */

import { execSync, spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHANGELOG_DIR = resolve(ROOT, 'changelog');

const cliArgs = process.argv.slice(2);
const dry = cliArgs.includes('--dry-run') || cliArgs.includes('-n');
const positional = cliArgs.filter((a) => !a.startsWith('-'));
const version = positional[0];
const fromTag = positional[1] ?? null;

if (!version) {
	console.error('Usage: bun scripts/summarize-changelog.js <version> [from-tag] [--dry-run]');
	process.exit(1);
}

// Resolve base tag
const lastTag = fromTag ?? (() => {
	try {
		return execSync('git describe --tags --abbrev=0', { encoding: 'utf8', cwd: ROOT }).trim();
	} catch {
		return null;
	}
})();

const logCmd = lastTag
	? `git log ${lastTag}..HEAD --no-merges --format="commit %h%nsubject: %s%nbody: %b%n---"`
	: `git log --no-merges --format="commit %h%nsubject: %s%nbody: %b%n---" -50`;

const commits = execSync(logCmd, { encoding: 'utf8', cwd: ROOT }).trim();

if (!commits) {
	console.log('No commits since last tag, skipping changelog.');
	process.exit(0);
}

const commitCount = (commits.match(/^commit /mg) ?? []).length;
console.log(`Summarizing ${commitCount} commits${lastTag ? ` since ${lastTag}` : ''}...`);

const outFile = `changelog/v${version}.md`;
const date = new Date().toISOString().split('T')[0];

const basePrompt = `Write a changelog entry for version v${version} of the heterarchy.fyi website (${date}).

The site is a community platform around sovereign technologies and non-hierarchical organisation. It has sections for glossary, writings, books, people, events, and open data.

Format:
# v${version} — ${date}

## Added
- ...

## Improved
- ...

## Fixed
- ...

Rules:
- Ignore any existing files in the changelog/ directory — base the entry solely on the commits below
- Only include sections that have actual changes — omit empty sections
- Each bullet is one short sentence (max ~12 words), naming the feature or page
- Do not start bullets with "Added", "Improved", "Fixed" or any verb matching the section header — the header already says it
- End each bullet with 1–2 representative commit hashes in brackets, e.g. [a1b2c3d] or [a1b2c3d, e4f5g6h] — pick the most relevant ones only, never list more than 3
- Do not enumerate sub-features inside a bullet — one idea per bullet
- Do not mention file names, variable names, or internal refactors
- Do not mention "single point of truth", "DRY", or code-quality work unless it changed something visible
- Aggressively group related commits into a single bullet
- Hard limit: 3–5 bullets per section, 8 bullets total across all sections

Commits:
${commits}`;

const prompt = dry
	? `${basePrompt}\n\nPrint the result to stdout only. Do not write any files.`
	: `${basePrompt}\n\nSave the result to the file ${outFile}.`;

if (!dry) mkdirSync(CHANGELOG_DIR, { recursive: true });

const codexArgs = ['exec'];
if (!dry) codexArgs.push('-c', 'sandbox_permissions=["disk-write-folder:changelog"]');

const result = spawnSync('codex', codexArgs, {
	input: prompt,
	cwd: ROOT,
	encoding: 'utf8',
	stdio: ['pipe', 'inherit', 'inherit'],
	timeout: 120_000,
});

if (result.error) {
	console.error('codex exec failed:', result.error.message);
	process.exit(1);
}

if (dry) {
	console.log('\n(dry run — changelog not saved)');
} else {
	const outPath = resolve(ROOT, outFile);
	if (!existsSync(outPath)) {
		console.error(`Expected ${outFile} to be created by codex but it was not found.`);
		process.exit(1);
	}
	console.log(`\n✓ ${outFile}\n`);
	console.log(readFileSync(outPath, 'utf8'));
}
