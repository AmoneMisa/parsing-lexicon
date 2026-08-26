import { locationCities } from './locations.js';
import { ODESA_METROPOLITAN_ENTITIES } from './odesa-metropolitan.js';
import {
  UA_LOCATION_COORDINATES,
  ukraineLocationCoordinates,
  ukraineLocationGeocodeCandidates,
} from './ua-geo-coordinates.js';

const LOCATION_KEYS = Object.freeze([
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
const normalizedPoint = (value) => {
  if (!value || !Number.isFinite(value.lat) || !Number.isFinite(value.lng)) return null;
  return freeze({ lat: Number(value.lat), lng: Number(value.lng) });
};

function descriptor(city, type, entry) {
  const canonical = entry?.canonical || entry?.name;
  if (!canonical) return null;
  const exact = ukraineLocationCoordinates(city, type, canonical);
  return freeze({
    city,
    type,
    canonical,
    aliases: freeze([...new Set(entry?.aliases || [])]),
    coordinates: exact,
    source: exact ? 'static' : 'geocode',
    candidates: exact ? freeze([]) : ukraineLocationGeocodeCandidates(city, type, canonical),
  });
}

/**
 * Enumerates every Ukrainian internal location entity known by the package.
 * Static verified anchors are attached immediately; every other entity gets a
 * deterministic city-scoped geocoding candidate instead of a fabricated point.
 */
export function ukraineLocationCoordinateDescriptors() {
  const rows = [];
  const seen = new Set();
  const dictionaries = locationCities('UA');

  for (const [city, dictionary] of Object.entries(dictionaries)) {
    for (const type of LOCATION_KEYS) {
      for (const entry of dictionary?.[type] || []) {
        const row = descriptor(city, type, entry);
        if (!row) continue;
        const id = `${city}\u0000${type}\u0000${row.canonical}`;
        if (seen.has(id)) continue;
        seen.add(id);
        rows.push(row);
      }
    }
  }

  // Odesa metropolitan has richer semantic entities than the legacy city
  // dictionary; include them in the same coverage list without duplicating rows.
  for (const entry of ODESA_METROPOLITAN_ENTITIES) {
    const type = ODESA_TYPE_TO_KEY[entry.type];
    if (!type) continue;
    const row = descriptor('Odesa', type, entry);
    if (!row) continue;
    const id = `Odesa\u0000${type}\u0000${row.canonical}`;
    if (seen.has(id)) continue;
    seen.add(id);
    rows.push(row);
  }

  return freeze(rows);
}

/** Summary useful for CI/audits and consumers deciding whether to prewarm geo. */
export function ukraineLocationCoordinateCoverage() {
  const rows = ukraineLocationCoordinateDescriptors();
  const byType = {};
  let staticCount = 0;
  for (const row of rows) {
    byType[row.type] ||= { total: 0, static: 0, resolvable: 0 };
    byType[row.type].total += 1;
    if (row.coordinates) {
      staticCount += 1;
      byType[row.type].static += 1;
    }
    if (row.coordinates || row.candidates.length) byType[row.type].resolvable += 1;
  }
  return freeze({
    total: rows.length,
    static: staticCount,
    resolvable: rows.filter((row) => row.coordinates || row.candidates.length).length,
    missing: rows.filter((row) => !row.coordinates && !row.candidates.length).length,
    byType: freeze(Object.fromEntries(Object.entries(byType).map(([key, value]) => [key, freeze(value)]))),
  });
}

/**
 * Resolves coordinates for every requested Ukrainian dependency using an injected
 * lookup(query) function. This intentionally mirrors the Uzbekistan metro
 * resolver pattern: no network dependency in the lexicon, deterministic queries,
 * and verified static anchors always win.
 */
export async function resolveUkraineLocationCoordinates(lookup, options = {}) {
  const rows = ukraineLocationCoordinateDescriptors();
  const cities = options.cities ? new Set(options.cities) : null;
  const types = options.types ? new Set(options.types) : null;
  const maxLookups = Number.isFinite(options.maxLookups) ? Math.max(0, options.maxLookups) : Number.POSITIVE_INFINITY;
  const results = [];
  let spent = 0;

  for (const row of rows) {
    if (cities && !cities.has(row.city)) continue;
    if (types && !types.has(row.type)) continue;

    if (row.coordinates) {
      results.push(freeze({ ...row, coordinates: row.coordinates, source: 'static' }));
      continue;
    }

    let coordinates = null;
    if (typeof lookup === 'function') {
      for (const query of row.candidates) {
        if (spent >= maxLookups) break;
        spent += 1;
        coordinates = normalizedPoint(await lookup(query, row));
        if (coordinates) break;
      }
    }

    results.push(freeze({
      ...row,
      coordinates,
      source: coordinates ? 'geocode' : 'unresolved',
    }));
  }

  return freeze(results);
}

export function staticUkraineLocationCoordinateCount() {
  let total = 0;
  for (const city of Object.values(UA_LOCATION_COORDINATES)) {
    for (const group of Object.values(city || {})) total += Object.keys(group || {}).length;
  }
  return total;
}
