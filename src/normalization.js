const APOSTROPHES_RE = /[’‘ʻʼ`´]/g;
const DASHES_RE = /[‐‑‒–—―]/g;

/** Normalize Unicode and punctuation variants without destroying letters. */
export function normalizeUnicode(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(APOSTROPHES_RE, "'")
    .replace(DASHES_RE, '-');
}

/**
 * Stable comparison form for parser dictionaries.
 * Keeps all Unicode letters/numbers, removes punctuation differences and folds ё.
 */
export function normalizeForMatch(value) {
  return normalizeUnicode(value)
    .toLocaleLowerCase()
    .replace(/ё/g, 'е')
    .replace(/['-]+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Search-only apostrophe compaction for Uzbek/Karakalpak variants. */
function normalizeCompactApostropheForMatch(value) {
  return normalizeUnicode(value)
    .toLocaleLowerCase()
    .replace(/ё/g, 'е')
    .replace(/'+/g, '')
    .replace(/-+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CYRILLIC_SEARCH_MAP = Object.freeze({
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
  ә: 'a', і: 'i', ң: 'ng', ө: 'o', ұ: 'u', ү: 'u', һ: 'h',
  є: 'ye', ї: 'yi', ґ: 'g',
});

const KAZAKH_SEARCH_EQUIVALENCE = Object.freeze({
  ә: 'а', ғ: 'г', қ: 'к', ң: 'н', ө: 'о', ұ: 'у', ү: 'у', і: 'и', һ: 'х',
});

/** Search-oriented Cyrillic folding; canonical identity still comes from explicit aliases. */
export function foldCyrillicForSearch(value) {
  return normalizeUnicode(value)
    .toLocaleLowerCase()
    .split('')
    .map((char) => CYRILLIC_SEARCH_MAP[char] ?? char)
    .join('');
}

function foldKazakhForSearch(value) {
  return normalizeUnicode(value)
    .toLocaleLowerCase()
    .split('')
    .map((char) => KAZAKH_SEARCH_EQUIVALENCE[char] ?? char)
    .join('');
}

export function normalizedAliasKeys(value, { transliteration = true } = {}) {
  const forms = transliteration
    ? [value, foldCyrillicForSearch(value), foldKazakhForSearch(value)]
    : [value];
  return [...new Set(forms.flatMap((form) => [
    normalizeForMatch(form),
    normalizeCompactApostropheForMatch(form),
  ]).filter(Boolean))];
}

export function aliasesOf(entry) {
  const aliases = entry?.aliases;
  if (Array.isArray(aliases)) return aliases;
  if (!aliases || typeof aliases !== 'object') return [];
  return Object.values(aliases).flatMap((values) => Array.isArray(values) ? values : []);
}

function createAliasIndex(entries, { transliteration = true } = {}) {
  const index = new Map();
  for (const entry of entries || []) {
    const values = [entry.canonical, entry.name, ...aliasesOf(entry)].filter(Boolean);
    for (const value of values) {
      for (const key of normalizedAliasKeys(value, { transliteration })) {
        if (!index.has(key)) index.set(key, entry);
      }
    }
  }
  return index;
}

/** Build a fresh alias index. Prefer getAliasIndex() for repeated parser calls. */
export function buildAliasIndex(entries, options = {}) {
  return createAliasIndex(entries, options);
}

const DEFAULT_ALIAS_INDEX_CACHE = new WeakMap();
const DIRECT_ALIAS_INDEX_CACHE = new WeakMap();

/** Cached alias index for stable/frozen lexicon arrays. */
export function getAliasIndex(entries, { transliteration = true } = {}) {
  if (!entries || (typeof entries !== 'object' && typeof entries !== 'function')) {
    return createAliasIndex(entries, { transliteration });
  }
  const cache = transliteration ? DEFAULT_ALIAS_INDEX_CACHE : DIRECT_ALIAS_INDEX_CACHE;
  let index = cache.get(entries);
  if (!index) {
    index = createAliasIndex(entries, { transliteration });
    cache.set(entries, index);
  }
  return index;
}

export function findCanonical(value, entries, { partial = false, transliteration = true } = {}) {
  if (!value) return null;
  const index = getAliasIndex(entries, { transliteration });
  for (const key of normalizedAliasKeys(value, { transliteration })) {
    const exact = index.get(key);
    if (exact) return exact;
  }
  if (!partial) return null;

  const textKeys = normalizedAliasKeys(value, { transliteration });
  let best = null;
  let bestLength = 0;
  for (const [alias, entry] of index) {
    if (alias.length <= bestLength) continue;
    if (textKeys.some((text) => ` ${text} `.includes(` ${alias} `))) {
      best = entry;
      bestLength = alias.length;
    }
  }
  return best;
}

/**
 * Collect aliases mapping to more than one canonical entity.
 * Direct normalized aliases are checked by default; search-fold collisions can
 * be enabled explicitly because transliteration intentionally creates overlaps.
 */
export function collectAliasCollisions(entries, { includeSearchFolds = false, allowed = [] } = {}) {
  const allowedSet = new Set(allowed.map(normalizeForMatch));
  const owners = new Map();
  for (const entry of entries || []) {
    const canonical = entry?.canonical || entry?.name;
    if (!canonical) continue;
    const values = [canonical, ...aliasesOf(entry)].filter(Boolean);
    for (const value of values) {
      const keys = normalizedAliasKeys(value, { transliteration: includeSearchFolds });
      for (const key of keys) {
        if (!key || allowedSet.has(key)) continue;
        const set = owners.get(key) || new Set();
        set.add(canonical);
        owners.set(key, set);
      }
    }
  }
  return [...owners.entries()]
    .filter(([, canonicals]) => canonicals.size > 1)
    .map(([alias, canonicals]) => Object.freeze({ alias, canonicals: Object.freeze([...canonicals]) }));
}

export function validateAliasCollisions(entries, options = {}) {
  const collisions = collectAliasCollisions(entries, options);
  if (collisions.length) {
    const preview = collisions.slice(0, 8).map((item) => `${item.alias} -> ${item.canonicals.join(', ')}`).join('; ');
    throw new Error(`Lexicon alias collisions detected (${collisions.length}): ${preview}`);
  }
  return true;
}

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function aliasesToRegex(values, flags = 'iu') {
  const alternatives = [...new Set(values || [])]
    .filter(Boolean)
    .map((value) => normalizeUnicode(value).trim())
    .sort((a, b) => b.length - a.length)
    .map((value) => escapeRegex(value).replace(/[\s\-–—'’‘`ʻʼ]+/g, "[\\s\\-–—'’‘`ʻʼ]*"));
  return new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:${alternatives.join('|')})(?:$|[^\\p{L}\\p{N}_])`, flags);
}
