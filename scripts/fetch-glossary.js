import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Allow self-signed/new certs during development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/lib/data/glossary.json');
const URL = 'https://glossary.heterarchy.fyi/';

const res = await fetch(URL, { signal: AbortSignal.timeout(15000) });
if (!res.ok) throw new Error(`Failed to fetch glossary: ${res.status}`);
const data = await res.json();
writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(`✓ Glossary: ${data.terms.length} terms → src/lib/data/glossary.json`);
