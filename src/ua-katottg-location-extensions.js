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

function cityKey(row) {
  return canonicalUkraineCity(row[1]) || row[1];
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

  // Every official settlement becomes addressable through the normal UA city
  // dictionary map. Known package cities collapse to their existing canonical key.
  for (const row of UA_KATOTTG_ROWS) {
    if (!SETTLEMENT_TYPES.has(row[3])) continue;
    const key = cityKey(row);
    result[key] ||= {};
    result[key].katottg = entriesByCode.get(row[0]);

    for (const ancestor of ancestry(row)) {
      const value = entriesByCode.get(ancestor[0]);
      if (!value || ancestor[0] === row[0]) continue;
      if (ancestor[3] === 'region') pushUnique(result[key], 'regions', value);
      else if (ancestor[3] === 'district') pushUnique(result[key], 'administrativeDistricts', value);
      else if (ancestor[3] === 'community') pushUnique(result[key], 'communities', value);
    }
  }

  // KATOTTG city districts are ordinary parser districts under the nearest city.
  for (const row of UA_KATOTTG_ROWS) {
    if (row[3] !== 'city_district') continue;
    const settlement = nearestSettlement(row);
    if (!settlement) continue;
    const key = cityKey(settlement);
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
