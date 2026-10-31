// Lists translation keys used in src/ with t('key') but missing per language: `node scripts/check-translations.mjs`
import fs from 'node:fs';
import path from 'node:path';
import { translations } from '../src/lib/translations.js';

const used = new Map();
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) walk(p);
  else if (/\.jsx?$/.test(e.name)) {
    for (const m of fs.readFileSync(p, 'utf8').matchAll(/\bt\(\s*['"`]([A-Za-z0-9_]+)['"`]\s*\)/g)) {
      if (!used.has(m[1])) used.set(m[1], path.basename(p));
    }
  }
});
walk('src');

let missingTotal = 0;
for (const [lang, dict] of Object.entries(translations)) {
  const missing = [...used.keys()].filter(k => !(k in dict));
  missingTotal += missing.length;
  console.log(`${lang}: ${missing.length} missing${missing.length ? ' - ' + missing.map(k => `${k} (${used.get(k)})`).join(', ') : ''}`);
}
process.exit(missingTotal ? 1 : 0);
