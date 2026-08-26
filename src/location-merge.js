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
  return Object.freeze({ canonical: name, name, aliases: Object.freeze(all), re: aliasesToRegex(all) });
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
  return Object.freeze({ ...base, canonical: base.canonical || base.name, type: base.type || base.entityType, aliases: Object.freeze(aliases), re: aliasesToRegex(aliases) });
}

function parentKey(entry) {
  return normalizeForMatch(entry?.parent || entry?.district || '');
}

export function mergeLocationEntries(...lists) {
  const groups = new Map();
  const order = [];

  for (const list of lists) {
    for (const entry of list || []) {
      if (!entry?.name) continue;
      const canonical = normalizeForMatch(entry.name);
      if (!groups.has(canonical)) {
        groups.set(canonical, []);
        order.push(canonical);
      }
      groups.get(canonical).push(entry);
    }
  }

  const result = [];
  for (const canonical of order) {
    const group = groups.get(canonical) || [];
    const scopedParents = [...new Set(group.map(parentKey).filter(Boolean))];

    if (scopedParents.length <= 1) {
      result.push(group.reduce((merged, entry) => mergeEntry(merged, entry), null));
      continue;
    }

    // A market name can legitimately exist under multiple parents inside one
    // city (for example Sairan in adjacent Almaty districts). Keep each scoped
    // entity. Unscoped/base aliases are merged into every scoped variant so
    // older dictionaries enrich rather than erase parent information.
    const unscoped = group.filter((entry) => !parentKey(entry));
    for (const parent of scopedParents) {
      const scoped = group.filter((entry) => parentKey(entry) === parent);
      result.push([...unscoped, ...scoped].reduce((merged, entry) => mergeEntry(merged, entry), null));
    }
  }

  return Object.freeze(result);
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
