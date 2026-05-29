/**
 * Records today's term of the day into src/lib/data/term-history.csv.
 * Run by Woodpecker CI daily. Skips if today is already recorded.
 *
 *   node scripts/record-term-today.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { localDateLabel, computeTermForDate } from '../src/lib/data/term-of-day-core.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '../src/lib/data');

const glossary = JSON.parse(readFileSync(resolve(DATA, 'glossary.json'), 'utf8'));
const pool = glossary.terms.filter((t) => t.excerpt || t.description);

const historyPath = resolve(DATA, 'term-history.csv');
const today = localDateLabel(new Date());
const existing = existsSync(historyPath) ? readFileSync(historyPath, 'utf8') : '';

if (existing.split('\n').some((line) => line.startsWith(today + ','))) {
	console.log(`Already recorded for ${today}, skipping.`);
	process.exit(0);
}

const term = computeTermForDate(pool, new Date());
const trimmed = existing.trimEnd();
const content = (trimmed ? trimmed + '\n' : '') + `${today},${term.id}\n`;
writeFileSync(historyPath, content);
console.log(`Recorded: ${today} → ${term.name} (${term.id})`);
