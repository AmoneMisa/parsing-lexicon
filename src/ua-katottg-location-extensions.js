import { aliasesToRegex, normalizeForMatch } from './normalization.js';
import { canonicalUkraineCity } from './ukraine.js';
import { UA_KATOTTG_META, UA_KATOTTG_ROWS } from './generated/ua-katottg.js';

const SETTLEMENT_TYPES = new Set(['special_city', 'city', 'urban_settlement', 'village', 'settlement']);
const freeze = (value) => Object.freeze(value);

function entry(row) {
  const [code, name, category, type, parentCode] = row;
  const aliases = freeze([name]);
  return freeze({
    canonical: name,
    name,
    aliases,
    re: aliasesToRegex(aliases),
    code,
    katottgCode: code,
    category,
    type,
    parentCode: parentCode || null,
    parent: parentCode || null,
    country: 'UA',
    source: 'katottg',
  });
}

const rowsByCode = new Map(UA_KATOTTG_ROWS.map((row) => [row[0], row]));
const entriesByCode = new Map(UA_KATOTTG_ROWS.map((row) => [row[0], entry(row)]));
const settlementRows = UA_KATOTTG_ROWS.filter((row) => SETTLEMENT_TYPES.has(row[3]));
const settlementNameCounts = new Map();
for (const row of settlementRows) {
  const key = normalizeForMatch(row[1]);
  settlementNameCounts.set(key, (settlementNameCounts.get(key) || 0) + 1);
}

function ancestry(row) {
  const chain = [];
  const seen = new Set();
  let current = row;
  while (current && !seen.has(current[0])) {
    seen.add(current[0]);
    chain.push(current);
    current = current[4] ? rowsByCode.get(current[4]) : null;
  }
  return chain.reverse();
}

function nearestSettlement(row) {
  const chain = ancestry(row);
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    if (SETTLEMENT_TYPES.has(chain[i][3])) return chain[i];
  }
  return null;
}

function nearestAncestor(row, type) {
  const chain = ancestry(row);
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    if (chain[i][3] === type) return chain[i];
  }
  return null;
}

function cityKey(row) {
  const canonical = canonicalUkraineCity(row[1]);
  if (canonical) return canonical;

  const normalized = normalizeForMatch(row[1]);
  if ((settlementNameCounts.get(normalized) || 0) <= 1) return row[1];

  const community = nearestAncestor(row, 'community');
  if (community?.[1]) return `${row[1]} (${community[1]})`;
  const district = nearestAncestor(row, 'district');
  if (district?.[1]) return `${row[1]} (${district[1]})`;
  return `${row[1]} [${row[0]}]`;
}

function pushUnique(target, key, value) {
  target[key] ||= [];
  const id = `${value.katottgCode || ''}\u0000${normalizeForMatch(value.canonical)}`;
  if (!target[key].some((item) => `${item.katottgCode || ''}\u0000${normalizeForMatch(item.canonical)}` === id)) {
    target[key].push(value);
  }
}

function build() {
  const result = {};
  const codeToKey = new Map();

  for (const row of settlementRows) {
    const key = cityKey(row);
    codeToKey.set(row[0], key);
    result[key] ||= {};
    if (result[key].katottg && result[key].katottg.katottgCode !== row[0]) {
      throw new Error(`KATOTTG settlement key collision: ${key}`);
    }
    result[key].katottg = entriesByCode.get(row[0]);

    for (const ancestor of ancestry(row)) {
      const value = entriesByCode.get(ancestor[0]);
      if (!value || ancestor[0] === row[0]) continue;
      if (ancestor[3] === 'region') pushUnique(result[key], 'regions', value);
      else if (ancestor[3] === 'district') pushUnique(result[key], 'administrativeDistricts', value);
      else if (ancestor[3] === 'community') pushUnique(result[key], 'communities', value);
    }
  }

  for (const row of UA_KATOTTG_ROWS) {
    if (row[3] !== 'city_district') continue;
    const settlement = nearestSettlement(row);
    if (!settlement) continue;
    const key = codeToKey.get(settlement[0]) || cityKey(settlement);
    result[key] ||= {};
    pushUnique(result[key], 'districts', entriesByCode.get(row[0]));
  }

  return freeze(Object.fromEntries(Object.entries(result).map(([key, dictionary]) => [
    key,
    freeze(Object.fromEntries(Object.entries(dictionary).map(([field, value]) => [
      field,
      Array.isArray(value) ? freeze(value) : value,
    ]))),
  ])));
}

export const UA_KATOTTG_LOCATION_EXTENSIONS = build();
export const UA_KATOTTG_LOCATION_META = UA_KATOTTG_META;
