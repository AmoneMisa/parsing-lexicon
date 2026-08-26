import fs from 'node:fs';
import { UA_KATOTTG_META, UA_KATOTTG_ROWS } from '../src/ua-location-catalog-katottg.js';
import { canonicalUkraineCity } from '../src/ukraine.js';

const rows = UA_KATOTTG_ROWS;
const byCode = new Map(rows.map((row) => [row[0], row]));
const settlementTypes = new Set(['special_city', 'city', 'urban_settlement', 'village', 'settlement']);
const canonicalCityTypes = new Set(['special_city', 'city']);
const settlementRows = rows.filter((row) => settlementTypes.has(row[3]));

function ancestry(row) {
  const out = [];
  const seen = new Set();
  let current = row;
  while (current && !seen.has(current[0])) {
    seen.add(current[0]);
    out.push(current);
    current = current[4] ? byCode.get(current[4]) : null;
  }
  return out.reverse();
}

function nearest(row, type) {
  const chain = ancestry(row);
  for (let i = chain.length - 1; i >= 0; i -= 1) if (chain[i][3] === type) return chain[i];
  return null;
}

function nearestSettlement(row) {
  const chain = ancestry(row);
  for (let i = chain.length - 1; i >= 0; i -= 1) if (settlementTypes.has(chain[i][3])) return chain[i];
  return null;
}

function norm(value) {
  return String(value || '').trim().toLocaleLowerCase('uk-UA').replace(/\s+/g, ' ');
}

const nameCounts = new Map();
for (const row of settlementRows) nameCounts.set(norm(row[1]), (nameCounts.get(norm(row[1])) || 0) + 1);

function preferredKey(row) {
  const canonical = canonicalUkraineCity(row[1]);
  const sameNameCount = nameCounts.get(norm(row[1])) || 0;
  if (canonical && canonicalCityTypes.has(row[3])) return canonical;
  if (sameNameCount <= 1) return row[1];
  const community = nearest(row, 'community');
  const district = nearest(row, 'district');
  const region = nearest(row, 'region');
  const scope = [...new Set([community?.[1], district?.[1], region?.[1]].filter(Boolean))].join(' / ');
  return scope ? `${row[1]} (${scope})` : row[1];
}

const preferredCounts = new Map();
for (const row of settlementRows) {
  const key = preferredKey(row);
  preferredCounts.set(key, (preferredCounts.get(key) || 0) + 1);
}
function cityKey(row) {
  const preferred = preferredKey(row);
  return (preferredCounts.get(preferred) || 0) > 1 ? `${preferred} [${row[0]}]` : preferred;
}

const dictionaries = new Map();
const settlementCodeToKey = new Map();
function dict(key) {
  if (!dictionaries.has(key)) dictionaries.set(key, { regions: [], administrativeDistricts: [], communities: [], settlements: [], districts: [] });
  return dictionaries.get(key);
}
function pushCode(list, code) {
  if (code && !list.includes(code)) list.push(code);
}

for (const row of settlementRows) {
  const key = cityKey(row);
  settlementCodeToKey.set(row[0], key);
  const target = dict(key);
  pushCode(target.settlements, row[0]);
  for (const ancestor of ancestry(row)) {
    if (ancestor[0] === row[0]) continue;
    if (ancestor[3] === 'region') pushCode(target.regions, ancestor[0]);
    else if (ancestor[3] === 'district') pushCode(target.administrativeDistricts, ancestor[0]);
    else if (ancestor[3] === 'community') pushCode(target.communities, ancestor[0]);
  }
}

for (const row of rows) {
  if (row[3] !== 'city_district') continue;
  const settlement = nearestSettlement(row);
  if (!settlement) continue;
  const key = settlementCodeToKey.get(settlement[0]) || cityKey(settlement);
  pushCode(dict(key).districts, row[0]);
}

const used = new Set();
for (const value of dictionaries.values()) for (const list of Object.values(value)) for (const code of list) used.add(code);
if (used.size !== rows.length) {
  const missing = rows.filter((row) => !used.has(row[0]));
  throw new Error(`Native catalog would lose ${missing.length} official rows; first=${JSON.stringify(missing.slice(0, 5))}`);
}

const q = JSON.stringify;
let out = `import { aliasesToRegex } from './normalization.js';\n\n`;
out += `const freeze = Object.freeze;\n`;
out += `function officialEntry(canonical, type, officialCode, officialParentCode, geocodeContext) {\n`;
out += `  const aliases = freeze([canonical]);\n  let compiledRegex = null;\n  return freeze({ canonical, name: canonical, aliases, type, country: 'UA', source: 'official', officialCode, officialParentCode: officialParentCode || null, parent: officialParentCode || null, geocodeContext: freeze(geocodeContext), get re() { if (!compiledRegex) compiledRegex = aliasesToRegex(aliases); return compiledRegex; } });\n}\n\n`;
out += `export const UA_NATIONAL_LOCATION_META = freeze(${JSON.stringify({ authority: UA_KATOTTG_META.authority, snapshot: UA_KATOTTG_META.snapshot, recordCount: rows.length, source: 'official-national-catalog' })});\n\n`;
out += `const NATIONAL_ENTRIES = freeze({\n`;
for (const row of rows) {
  const [code, name, , type, parentCode] = row;
  const context = ancestry(row).map((item) => item[1]).filter(Boolean);
  out += `  ${q(code)}: officialEntry(${q(name)}, ${q(type)}, ${q(code)}, ${q(parentCode || null)}, ${q(context)}),\n`;
}
out += `});\n\n`;
out += `export const UA_NATIONAL_LOCATION_EXTENSIONS = freeze({\n`;
for (const [key, value] of dictionaries) {
  out += `  ${q(key)}: freeze({`;
  for (const [field, codes] of Object.entries(value)) {
    if (!codes.length) continue;
    out += `${field}: freeze([${codes.map((code) => `NATIONAL_ENTRIES[${q(code)}]`).join(',')}]),`;
  }
  out += `}),\n`;
}
out += `});\n`;

fs.writeFileSync('src/ua-location-extensions-national.js', out, 'utf8');
console.log(`wrote ${rows.length} official rows into ${dictionaries.size} native UA location dictionaries`);
