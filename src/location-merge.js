import { aliasesToRegex, normalizeForMatch } from './normalization.js';

export const LOCATION_LIST_KEYS = Object.freeze([
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

export function locationEntry(name, ...aliases) {
  const all = [...new Set([name, ...aliases].flat().filter(Boolean))];
  return Object.freeze({ name, aliases: Object.freeze(all), re: aliasesToRegex(all) });
}

export function locationEntries(rows = []) {
  return Object.freeze(rows.map(([name, ...aliases]) => locationEntry(name, ...aliases)));
}

function mergeEntry(existing, incoming) {
  const aliases = [...new Set([
    ...(existing?.aliases || []),
    ...(incoming?.aliases || []),
    existing?.name,
    incoming?.name,
  ].filter(Boolean))];
  const base = { ...(existing || {}), ...(incoming || {}) };
  return Object.freeze({ ...base, aliases: Object.freeze(aliases), re: aliasesToRegex(aliases) });
}

export function mergeLocationEntries(...lists) {
  const byCanonical = new Map();
  const order = [];

  for (const list of lists) {
    for (const entry of list || []) {
      if (!entry?.name) continue;
      const key = normalizeForMatch(entry.name);
      if (!byCanonical.has(key)) order.push(key);
      byCanonical.set(key, mergeEntry(byCanonical.get(key), entry));
    }
  }

  return Object.freeze(order.map((key) => byCanonical.get(key)));
}

export function mergeLocationCityDictionaries(...dictionaries) {
  const result = {};
  for (const key of LOCATION_LIST_KEYS) {
    const lists = dictionaries.map((dictionary) => dictionary?.[key]).filter(Boolean);
    if (lists.length) result[key] = mergeLocationEntries(...lists);
  }

  for (const dictionary of dictionaries) {
    if (!dictionary) continue;
    for (const [key, value] of Object.entries(dictionary)) {
      if (LOCATION_LIST_KEYS.includes(key) || value == null) continue;
      result[key] = value;
    }
  }

  return Object.freeze(result);
}

export function mergeLocationCountries(...countries) {
  const cityNames = [...new Set(countries.flatMap((country) => Object.keys(country || {})))];
  return Object.freeze(Object.fromEntries(cityNames.map((city) => [
    city,
    mergeLocationCityDictionaries(...countries.map((country) => country?.[city]).filter(Boolean)),
  ])));
}
