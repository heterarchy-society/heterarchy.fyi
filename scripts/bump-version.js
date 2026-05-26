import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PKG_PATH = resolve(ROOT, 'package.json');

const args = process.argv.slice(2);
const dry = args.includes('--dry-run') || args.includes('-n');
const arg = args.find((a) => !a.startsWith('-'));

if (!arg || (!['patch', 'minor', 'major'].includes(arg) && !/^\d+\.\d+\.\d+$/.test(arg))) {
	console.error('Usage: bun scripts/bump-version.js [patch|minor|major|x.y.z] [--dry-run]');
	process.exit(1);
}

if (dry) console.log('(dry run — no files will be changed)\n');

const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

let next;
if (arg === 'patch')      next = `${major}.${minor}.${patch + 1}`;
else if (arg === 'minor') next = `${major}.${minor + 1}.0`;
else if (arg === 'major') next = `${major + 1}.0.0`;
else                      next = arg;

// Generate changelog via codex before committing
console.log(`\nGenerating changelog for v${next}...`);
const summarizerArgs = ['scripts/summarize-changelog.js', next];
if (dry) summarizerArgs.push('--dry-run');
const summarizer = spawnSync('bun', summarizerArgs, { cwd: ROOT, stdio: 'inherit' });
if (summarizer.status !== 0) {
	console.error('Changelog generation failed. Aborting bump.');
	process.exit(1);
}

// Read generated changelog for commit message body
const changelogPath = resolve(ROOT, `changelog/v${next}.md`);
const changelogBody = !dry && existsSync(changelogPath)
	? '\n\n' + readFileSync(changelogPath, 'utf8').trim()
	: '';

// Bump package.json
console.log(`  package.json  → v${next}`);
if (!dry) {
	pkg.version = next;
	writeFileSync(PKG_PATH, JSON.stringify(pkg, null, '\t') + '\n', 'utf8');
}

// Stage and commit
const message = `chore: bump version to v${next}${changelogBody}`;
console.log(`  commit: ${message.split('\n')[0]}`);
console.log(`  tag:    v${next}`);

if (!dry) {
	execSync(`git add package.json`, { cwd: ROOT });
	if (existsSync(changelogPath)) execSync(`git add changelog/v${next}.md`, { cwd: ROOT });
	execSync(`git commit -m ${JSON.stringify(message)}`, { cwd: ROOT, stdio: 'inherit' });
	execSync(`git tag v${next}`, { cwd: ROOT });
	console.log(`\n✓ v${next} tagged`);
	console.log(`  push with: git push && git push --tags`);
} else {
	console.log('\n(dry run complete — nothing committed)');
}
