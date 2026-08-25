export const LEXICON_LANGUAGES = Object.freeze([
  'all',
  'ru',
  'en',
  'uk',
  'ro',
  'uzLatn',
  'uzCyrl',
  'kaaLat',
  'kaaCyrl',
  'kk',
]);

export const COUNTRY_CODES = Object.freeze(['UZ', 'KZ', 'UA', 'RO', 'KG']);

export function deepFreeze(value, seen = new WeakSet()) {
  if (value == null || (typeof value !== 'object' && typeof value !== 'function')) return value;
  if (seen.has(value)) return value;
  seen.add(value);

  // Freezing Map/Set objects does not make their entries immutable, so they are
  // intentionally not used as public mutable lexicon indexes. Freeze ordinary
  // nested objects/arrays/regexes only.
  if (value instanceof Map || value instanceof Set) return value;

  for (const key of Reflect.ownKeys(value)) {
    const child = value[key];
    if (child && (typeof child === 'object' || typeof child === 'function')) deepFreeze(child, seen);
  }
  return Object.freeze(value);
}

function aliasIdentity(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[’‘ʻʼ`´]/g, "'")
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/ё/g, 'е')
    .replace(/['-]+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeAliases(values = []) {
  const seen = new Set();
  return values.filter((value) => {
    const key = aliasIdentity(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function freezeAliases(aliases = {}) {
  if (Array.isArray(aliases)) return Object.freeze(dedupeAliases(aliases));
  return Object.freeze(Object.fromEntries(
    Object.entries(aliases).map(([language, values]) => [
      language,
      Object.freeze(Array.isArray(values) ? dedupeAliases(values) : []),
    ]),
  ));
}

export function lexiconEntity(canonical, aliases = {}, extra = {}) {
  return deepFreeze({
    ...extra,
    canonical,
    aliases: freezeAliases(aliases),
  });
}

export function locationEntity(canonical, aliases = [], extra = {}) {
  return deepFreeze({
    ...extra,
    canonical,
    name: canonical,
    aliases: Object.freeze(dedupeAliases(aliases)),
  });
}
