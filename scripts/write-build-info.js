import fs from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import git from 'isomorphic-git';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(__dirname, '../src/lib/data/build-info.ts');

async function getHeadCommit() {
	try {
		return await git.resolveRef({ fs, dir: ROOT, ref: 'HEAD' });
	} catch {
		return null;
	}
}

const commit = process.env.GITHUB_SHA ?? (await getHeadCommit()) ?? 'unknown';
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
