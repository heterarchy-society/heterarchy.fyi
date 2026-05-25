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
const books = raw.books.map(({ cover, _assets, ...rest }) => {
  const item = { ...rest, cover };
  if (cover) {
    item.coverUrl = `${BOOKS_BASE}/assets/${cover}`;
    if (_assets && _assets[cover] && _assets[cover].image && _assets[cover].image.versions) {
      item.coverVersions = {};
      for (const [w, v] of Object.entries(_assets[cover].image.versions)) {
        item.coverVersions[w] = `${BOOKS_BASE}/assets/${v.src}`;
      }
    }
  }
  return item;
});
writeFileSync(`${DATA}/books.json`, JSON.stringify({ ...raw, books }, null, 2) + '\n');
console.log(`✓ Books: ${books.length} books → src/lib/data/books.json`);

// Writings
const writings = await fetchJson('https://writings.data.heterarchy.fyi/');
writeFileSync(`${DATA}/writings.json`, JSON.stringify(writings, null, 2) + '\n');
console.log(`✓ Writings: ${writings.writings.length} writings → src/lib/data/writings.json`);

// People
try {
  const PEOPLE_BASE = 'https://people.data.heterarchy.fyi';
  const rawPeople = await fetchJson(`${PEOPLE_BASE}/`);

  function avatarVersions(personId, filename, assets) {
    const versions = assets?.[filename]?.image?.versions;
    if (!versions) return null;
    const result = {};
    for (const [w, v] of Object.entries(versions)) {
      result[w] = `${PEOPLE_BASE}/people/${personId}/${v.src}`;
    }
    return result;
  }

  const people = {
    ...rawPeople,
    people: (rawPeople.people ?? []).map(({ _assets, ...person }) => {
      const item = { ...person };
      if (person.avatar) {
        const v = avatarVersions(person.id, person.avatar, _assets);
        if (v) item.avatarVersions = v;
      }
      if (person.avatarsAlt?.length) {
        item.avatarsAltVersions = person.avatarsAlt.map(
          (f) => avatarVersions(person.id, f, _assets) ?? null
        );
      }
      return item;
    }),
  };

  writeFileSync(`${DATA}/people.json`, JSON.stringify(people, null, 2) + '\n');
  console.log(`✓ People: ${people.people?.length ?? 0} people → src/lib/data/people.json`);
} catch (error) {
  console.warn(`⚠ People dataset not fetched yet: ${error.message}`);
}
