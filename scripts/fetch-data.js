import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';


const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '../src/lib/data');

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Glossary
const glossary = await fetchJson('https://glossary.data.heterarchy.fyi/');
writeFileSync(`${DATA}/glossary.json`, JSON.stringify(glossary, null, 2) + '\n');
console.log(`✓ Glossary: ${glossary.terms.length} terms → src/lib/data/glossary.json`);

// Books
const BOOKS_BASE = 'https://books.data.heterarchy.fyi';
const raw = await fetchJson(`${BOOKS_BASE}/index.json`);
const books = raw.books.map(({ cover, ...rest }) => ({
  ...rest,
  ...(cover ? { coverUrl: `${BOOKS_BASE}/assets/${cover}` } : {}),
}));
writeFileSync(`${DATA}/books.json`, JSON.stringify({ ...raw, books }, null, 2) + '\n');
console.log(`✓ Books: ${books.length} books → src/lib/data/books.json`);

// Writings
const writings = await fetchJson('https://writings.data.heterarchy.fyi/');
writeFileSync(`${DATA}/writings.json`, JSON.stringify(writings, null, 2) + '\n');
console.log(`✓ Writings: ${writings.writings.length} writings → src/lib/data/writings.json`);

// People
try {
  const people = await fetchJson('https://people.data.heterarchy.fyi/');
  writeFileSync(`${DATA}/people.json`, JSON.stringify(people, null, 2) + '\n');
  console.log(`✓ People: ${people.people?.length ?? 0} people → src/lib/data/people.json`);
} catch (error) {
  console.warn(`⚠ People dataset not fetched yet: ${error.message}`);
}
