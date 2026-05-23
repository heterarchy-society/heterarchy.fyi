import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/lib/data/build-info.ts');

function git(command) {
	try {
		return execSync(command, { encoding: 'utf8' }).trim();
	} catch {
		return null;
	}
}

const commit = process.env.GITHUB_SHA ?? git('git rev-parse HEAD') ?? 'unknown';
const deployedAt = process.env.BUILD_TIME ?? new Date().toISOString();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
	OUT,
	`export const buildInfo = ${JSON.stringify(
		{
			commit,
			shortCommit: commit === 'unknown' ? 'unknown' : commit.slice(0, 7),
			deployedAt
		},
		null,
		'\t'
	)} satisfies { commit: string; shortCommit: string; deployedAt: string };\n`,
	'utf8'
);

console.log(`✓ Build info: ${commit.slice(0, 7)} @ ${deployedAt}`);
