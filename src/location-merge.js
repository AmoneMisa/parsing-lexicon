import { aliasesToRegex, normalizeForMatch } from './normalization.js';

const MAP_DATA_ENTRIES = new WeakSet();

export function markMapDataEntries(country) {
  for (const city of Object.values(country || {})) {
    for (const entries of Object.values(city || {})) {
      for (const entry of entries || []) MAP_DATA_ENTRIES.add(entry);
    }
  }
  return country;
}

export function isMapDataEntry(entry) {
  return Boolean(entry?.mapData) || MAP_DATA_ENTRIES.has(entry);
}

export const LOCATION_LIST_KEYS = Object.freeze([
  'districts',
  'microdistricts',
  'mahallas',
  'localAreas',
  'suburbs',
  'settlements',
  'developmentAreas',
  'residentialComplexes',
  'metro',
  'streets',
  'landmarks',
  'pois',
  'searchClusters',
]);

// One shared accessor compiles an entry's alias regex on first use. Giving
// every entry its own getter closure cost ~100 bytes per entry, and the full
// dictionary set holds over 130,000 entries. The compiled regex lives in a
// WeakMap because entries are frozen.
const COMPILED_RE = new WeakMap();
const ENTRY_PROTOTYPE = Object.freeze({
  get re() {
    let re = COMPILED_RE.get(this);
    if (!re) {
      re = aliasesToRegex(this.aliases);
      COMPILED_RE.set(this, re);
    }
    return re;
  },
});

function frozenEntry(fields) {
  return Object.freeze(Object.assign(Object.create(ENTRY_PROTOTYPE), fields));
}

export function locationEntry(name, ...aliases) {
  const all = [...new Set([name, ...aliases].flat().filter(Boolean))];
  return frozenEntry({ canonical: name, name, aliases: Object.freeze(all) });
}

export function locationEntries(rows = []) {
  return Object.freeze(rows.map(([name, ...aliases]) => locationEntry(name, ...aliases)));
}

// Copy an entry's data fields without touching its lazy `re` getter. Object
// spread invokes getters, which would compile every alias regex eagerly at
// merge time (tens of seconds at import) instead of on first match.
function entryData(entry) {
  const data = {};
  if (!entry) return data;
  for (const key of Object.keys(entry)) {
    if (key !== 're') data[key] = entry[key];
  }
  return data;
}

function uniqueTruthy(values) {
  if (values.length > 32) return new Set(values).size === values.length && values.every(Boolean);
  for (let i = 0; i < values.length; i += 1) {
    if (!values[i]) return false;
    for (let j = 0; j < i; j += 1) if (values[j] === values[i]) return false;
  }
  return true;
}

// Merging one entry with nothing returns an entry equal to itself when it is
// already frozen, canonical, untyped and carries a unique alias list that
// names it (every locationEntry()/mergeEntry() result does). Nearly every
// group at import time is a single such entry, so reuse it instead of
// rebuilding it. Map-data marking is by identity, so it is preserved as is.
function isFinishedEntry(entry) {
  if (!Object.isFrozen(entry) || !entry.canonical || entry.type !== undefined || entry.entityType !== undefined) return false;
  const aliases = entry.aliases;
  return Array.isArray(aliases) && Object.isFrozen(aliases) && aliases.includes(entry.name) && uniqueTruthy(aliases);
}

function mergeEntry(existing, incoming) {
  const aliases = [...new Set([
    ...(existing?.aliases || []),
    ...(incoming?.aliases || []),
    existing?.name,
    incoming?.name,
  ].filter(Boolean))];
  const base = { ...entryData(existing), ...entryData(incoming) };
  // A map-data entry may enrich an existing reviewed owner with additional
  // aliases. It remains fallback-only only when every merged source is map
  // data; otherwise the reviewed owner must retain its matching precedence.
  const mapData = existing ? isMapDataEntry(existing) && isMapDataEntry(incoming) : isMapDataEntry(incoming);
  const result = frozenEntry({
    ...base,
    canonical: base.canonical || base.name,
    type: base.type || base.entityType,
    aliases: Object.freeze(aliases),
  });
  if (mapData) MAP_DATA_ENTRIES.add(result);
  return result;
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
    if (group.length === 1) {
      result.push(isFinishedEntry(group[0]) ? group[0] : mergeEntry(null, group[0]));
      continue;
    }
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
