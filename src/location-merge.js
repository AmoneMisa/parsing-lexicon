import { aliasesToRegex, normalizeForMatch } from './normalization.js';

export const LOCATION_LIST_KEYS = Object.freeze([
  'regions',
  'administrativeDistricts',
  'communities',
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
    existing?.canonical,
    incoming?.canonical,
    existing?.name,
    incoming?.name,
  ].filter(Boolean))];
  const base = { ...(existing || {}), ...(incoming || {}) };

  const existingIsCurated = existing && existing.source !== 'katottg';
  const incomingIsKatottg = incoming?.source === 'katottg';
  const canonical = existingIsCurated && incomingIsKatottg
    ? (existing.canonical || existing.name)
    : (base.canonical || base.name);
  const name = existingIsCurated && incomingIsKatottg
    ? (existing.name || canonical)
    : (base.name || canonical);
  const existingSource = existingIsCurated ? (existing.source || 'curated') : existing?.source;
  const sources = [...new Set([
    ...(existing?.sources || []), existingSource,
    ...(incoming?.sources || []), incoming?.source,
  ].filter(Boolean))];
  const source = existingIsCurated && incomingIsKatottg ? existingSource : base.source;

  return Object.freeze({
    ...base,
    canonical,
    name,
    source,
    ...(sources.length ? { sources: Object.freeze(sources) } : {}),
    type: base.type || base.entityType,
    aliases: Object.freeze(aliases),
    re: aliasesToRegex(aliases),
  });
}

function parentKey(entry) {
  return normalizeForMatch(entry?.parent || entry?.parentCode || entry?.district || '');
}

function identityKeys(entry) {
  return [...new Set([
    entry?.canonical,
    entry?.name,
    ...(entry?.aliases || []),
  ].map(normalizeForMatch).filter(Boolean))];
}

export function mergeLocationEntries(...lists) {
  const groups = [];
  const keyToGroup = new Map();

  for (const list of lists) {
    for (const entry of list || []) {
      if (!entry?.name && !entry?.canonical) continue;
      const keys = identityKeys(entry);
      if (!keys.length) continue;

      const matched = [...new Set(keys.map((key) => keyToGroup.get(key)).filter((index) => index != null))];
      let target;
      if (!matched.length) {
        target = groups.length;
        groups.push([]);
      } else {
        target = Math.min(...matched);
        for (const index of matched) {
          if (index === target || !groups[index]?.length) continue;
          groups[target].push(...groups[index]);
          for (const groupedEntry of groups[index]) {
            for (const key of identityKeys(groupedEntry)) keyToGroup.set(key, target);
          }
          groups[index] = [];
        }
      }

      groups[target].push(entry);
      for (const key of keys) keyToGroup.set(key, target);
    }
  }

  const result = [];
  for (const group of groups) {
    if (!group?.length) continue;
    const scopedParents = [...new Set(group.map(parentKey).filter(Boolean))];

    if (scopedParents.length <= 1) {
      result.push(group.reduce((merged, entry) => mergeEntry(merged, entry), null));
      continue;
    }

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
