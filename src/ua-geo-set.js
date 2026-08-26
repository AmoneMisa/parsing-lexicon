import { normalizeForMatch } from './normalization.js';
import { locationCities } from './locations.js';
import { ODESA_METROPOLITAN_ENTITIES } from './odesa-metropolitan.js';
import { UA_KATOTTG_META, UA_KATOTTG_ROWS } from './generated/ua-katottg.js';

const INTERNAL_KEYS = Object.freeze([
  'districts',
  'microdistricts',
  'mahallas',
  'localAreas',
  'suburbs',
  'settlements',
  'metro',
  'residentialComplexes',
  'streets',
  'landmarks',
  'pois',
  'searchClusters',
]);

const ODESA_TYPE_TO_KEY = Object.freeze({
  district: 'districts',
  microdistrict: 'microdistricts',
  local_area: 'localAreas',
  informal_area: 'localAreas',
  suburb: 'suburbs',
  settlement: 'settlements',
  residential_complex: 'residentialComplexes',
  development_area: 'residentialComplexes',
  'poi.shopping_mall': 'pois',
  'poi.beach': 'pois',
  'poi.park': 'pois',
  'poi.landmark': 'pois',
  'poi.market': 'pois',
});

const freeze = (value) => Object.freeze(value);
let administrativeCache = null;
let administrativeByCode = null;
let administrativeByName = null;
let administrativeChildren = null;
let internalCache = null;

function administrativeEntity(row) {
  const [code, name, category, type, parentCode] = row;
  return freeze({ code, name, category, type, parentCode: parentCode || null, source: 'katottg' });
}

function ensureAdministrativeIndexes() {
  if (administrativeCache) return;
  const rows = UA_KATOTTG_ROWS.map(administrativeEntity);
  const byCode = new Map();
  const byName = new Map();
  const children = new Map();

  for (const row of rows) {
    byCode.set(row.code, row);
    const key = normalizeForMatch(row.name);
    if (key) {
      const bucket = byName.get(key) || [];
      bucket.push(row);
      byName.set(key, bucket);
    }
    if (row.parentCode) {
      const bucket = children.get(row.parentCode) || [];
      bucket.push(row);
      children.set(row.parentCode, bucket);
    }
  }

  administrativeCache = freeze(rows);
  administrativeByCode = byCode;
  administrativeByName = byName;
  administrativeChildren = children;
}

export const UA_ADMINISTRATIVE_GEO_META = UA_KATOTTG_META;

/** Official nationwide KATOTTG snapshot vendored into this package. */
export function ukraineAdministrativeGeoSet() {
  ensureAdministrativeIndexes();
  return administrativeCache;
}

export function ukraineAdministrativeGeoByCode(code) {
  ensureAdministrativeIndexes();
  return administrativeByCode.get(String(code || '').trim()) || null;
}

export function findUkraineAdministrativeGeo(value, options = {}) {
  ensureAdministrativeIndexes();
  const key = normalizeForMatch(value);
  if (!key) return freeze([]);
  const types = options.types ? new Set(options.types) : null;
  const parentCode = options.parentCode ? String(options.parentCode) : null;
  const limit = Number.isFinite(options.limit) ? Math.max(0, options.limit) : 50;
  const rows = administrativeByName.get(key) || [];
  return freeze(rows
    .filter((row) => (!types || types.has(row.type)) && (!parentCode || row.parentCode === parentCode))
    .slice(0, limit));
}

export function ukraineAdministrativeChildrenOf(parentCode, options = {}) {
  ensureAdministrativeIndexes();
  const types = options.types ? new Set(options.types) : null;
  const rows = administrativeChildren.get(String(parentCode || '').trim()) || [];
  return freeze(types ? rows.filter((row) => types.has(row.type)) : [...rows]);
}

export function ukraineAdministrativeAncestry(value) {
  ensureAdministrativeIndexes();
  let row = typeof value === 'string' ? ukraineAdministrativeGeoByCode(value) : value;
  if (!row?.code) return freeze([]);
  const chain = [];
  const seen = new Set();
  while (row && !seen.has(row.code)) {
    seen.add(row.code);
    chain.push(row);
    row = row.parentCode ? administrativeByCode.get(row.parentCode) : null;
  }
  return freeze(chain.reverse());
}

/** Deterministic offline query candidates; actual geocoder is injected by consumers. */
export function ukraineAdministrativeGeocodeCandidates(value) {
  const row = typeof value === 'string' ? ukraineAdministrativeGeoByCode(value) : value;
  if (!row?.code) return freeze([]);
  const ancestry = ukraineAdministrativeAncestry(row);
  const names = ancestry.map((entry) => entry.name).filter(Boolean);
  const full = [...names, 'Ukraine'].join(', ');
  const short = `${row.name}, Ukraine`;
  return freeze([...new Set([full, short])]);
}

function internalRow(city, type, entry) {
  const canonical = entry?.canonical || entry?.name;
  if (!canonical) return null;
  return freeze({
    city,
    type,
    canonical,
    aliases: freeze([...new Set(entry?.aliases || [])]),
    source: 'curated',
  });
}

/**
 * Housing/search geography owned by parsing-lexicon: districts, microdistricts,
 * residential complexes, metro, streets, POIs, suburbs, local areas, etc.
 */
export function ukraineInternalGeoSet() {
  if (internalCache) return internalCache;
  const rows = [];
  const seen = new Set();

  for (const [city, dictionary] of Object.entries(locationCities('UA'))) {
    for (const type of INTERNAL_KEYS) {
      for (const entry of dictionary?.[type] || []) {
        const row = internalRow(city, type, entry);
        if (!row) continue;
        const id = `${city}\u0000${type}\u0000${row.canonical}`;
        if (seen.has(id)) continue;
        seen.add(id);
        rows.push(row);
      }
    }
  }

  for (const entry of ODESA_METROPOLITAN_ENTITIES) {
    const type = ODESA_TYPE_TO_KEY[entry.type];
    if (!type) continue;
    const row = internalRow('Odesa', type, entry);
    if (!row) continue;
    const id = `Odesa\u0000${type}\u0000${row.canonical}`;
    if (seen.has(id)) continue;
    seen.add(id);
    rows.push(row);
  }

  internalCache = freeze(rows);
  return internalCache;
}

export function ukraineGeoSetCoverage() {
  const administrative = ukraineAdministrativeGeoSet();
  const internal = ukraineInternalGeoSet();
  const administrativeByType = {};
  const internalByType = {};
  for (const row of administrative) administrativeByType[row.type] = (administrativeByType[row.type] || 0) + 1;
  for (const row of internal) internalByType[row.type] = (internalByType[row.type] || 0) + 1;
  return freeze({
    snapshot: UA_ADMINISTRATIVE_GEO_META.snapshot,
    administrative: administrative.length,
    internal: internal.length,
    administrativeByType: freeze(administrativeByType),
    internalByType: freeze(internalByType),
  });
}
