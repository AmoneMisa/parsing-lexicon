import { LEXICON_LANGUAGES } from './lexicon-core.js';

const APOSTROPHES_RE = /[’‘ʻʼ`´]/g;
const DASHES_RE = /[‐‑‒–—―]/g;

/** Normalize Unicode and punctuation variants without destroying letters. */
export function normalizeUnicode(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(APOSTROPHES_RE, "'")
    .replace(DASHES_RE, '-');
}

/** Stable comparison form for parser dictionaries. */
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

export const CYRILLIC_SEARCH_MAP = Object.freeze({
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

function valuesOf(entry) {
  return [entry?.canonical, entry?.name, ...aliasesOf(entry)].filter(Boolean);
}

function createAliasIndex(entries, { transliteration = true } = {}) {
  const index = new Map();
  for (const entry of entries || []) {
    for (const value of valuesOf(entry)) {
      for (const key of normalizedAliasKeys(value, { transliteration })) {
        if (!index.has(key)) index.set(key, entry);
      }
    }
  }
  return index;
}

function createAliasOwnersIndex(entries, { transliteration = true } = {}) {
  const index = new Map();
  for (const entry of entries || []) {
    for (const sourceAlias of valuesOf(entry)) {
      const searchForms = transliteration
        ? [sourceAlias, foldCyrillicForSearch(sourceAlias), foldKazakhForSearch(sourceAlias)]
        : [sourceAlias];
      for (const searchAlias of searchForms) {
        for (const key of normalizedAliasKeys(searchAlias, { transliteration: false })) {
          if (!key) continue;
          const owners = index.get(key) || [];
          if (!owners.some((owner) => owner.entry === entry && owner.sourceAlias === sourceAlias)) {
            owners.push(Object.freeze({ entry, sourceAlias, searchAlias }));
          }
          index.set(key, owners);
        }
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
const DEFAULT_OWNERS_INDEX_CACHE = new WeakMap();
const DIRECT_OWNERS_INDEX_CACHE = new WeakMap();
const DEFAULT_MATCHER_CACHE = new WeakMap();
const DIRECT_MATCHER_CACHE = new WeakMap();

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

export function getAliasOwnersIndex(entries, { transliteration = true } = {}) {
  if (!entries || (typeof entries !== 'object' && typeof entries !== 'function')) {
    return createAliasOwnersIndex(entries, { transliteration });
  }
  const cache = transliteration ? DEFAULT_OWNERS_INDEX_CACHE : DIRECT_OWNERS_INDEX_CACHE;
  let index = cache.get(entries);
  if (!index) {
    index = createAliasOwnersIndex(entries, { transliteration });
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

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function aliasPattern(value) {
  return escapeRegex(normalizeUnicode(value).trim())
    .replace(/[\s\-–—'’‘`ʻʼ]+/g, "[\\s\\-–—'’‘`ʻʼ]*");
}

function matcherFor(entries, { transliteration = true } = {}) {
  const cache = transliteration ? DEFAULT_MATCHER_CACHE : DIRECT_MATCHER_CACHE;
  if (entries && typeof entries === 'object' && cache.has(entries)) return cache.get(entries);

  const owners = createAliasOwnersIndex(entries, { transliteration });
  const searchAliases = [...new Set(
    [...owners.values()].flatMap((values) => values.map((owner) => owner.searchAlias)),
  )]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  const result = searchAliases.length
    ? Object.freeze({
        owners,
        re: new RegExp(`(?<![\\p{L}\\p{N}_])(?:${searchAliases.map(aliasPattern).join('|')})(?![\\p{L}\\p{N}_])`, 'giu'),
      })
    : Object.freeze({ owners, re: null });

  if (entries && typeof entries === 'object') cache.set(entries, result);
  return result;
}

/**
 * Return every canonical match with original-text offsets. Colliding aliases are
 * deliberately returned as multiple matches instead of silently choosing one.
 */
export function findAllCanonical(value, entries, { transliteration = true } = {}) {
  const text = normalizeUnicode(value ?? '');
  if (!text || !entries?.length) return [];
  const { owners, re } = matcherFor(entries, { transliteration });
  if (!re) return [];

  re.lastIndex = 0;
  const matches = [];
  const seen = new Set();
  for (const match of text.matchAll(re)) {
    const alias = match[0];
    const start = match.index ?? 0;
    const end = start + alias.length;
    const keys = normalizedAliasKeys(alias, { transliteration });
    const candidates = [];
    for (const key of keys) {
      for (const owner of owners.get(key) || []) candidates.push(owner);
    }
    for (const owner of candidates) {
      const canonical = owner.entry?.canonical || owner.entry?.name || null;
      const id = `${start}:${end}:${canonical}:${owner.sourceAlias}`;
      if (seen.has(id)) continue;
      seen.add(id);
      matches.push(Object.freeze({
        entry: owner.entry,
        canonical,
        alias,
        sourceAlias: owner.sourceAlias,
        normalizedAlias: normalizeForMatch(alias),
        start,
        end,
      }));
    }
  }
  return matches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
}

/** Collect aliases mapping to more than one canonical entity. */
export function collectAliasCollisions(entries, { includeSearchFolds = false, allowed = [] } = {}) {
  const allowedSet = new Set(allowed.map(normalizeForMatch));
  const owners = new Map();
  for (const entry of entries || []) {
    const canonical = entry?.canonical || entry?.name;
    if (!canonical) continue;
    for (const value of [canonical, ...aliasesOf(entry)].filter(Boolean)) {
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

/**
 * Validate structural lexicon invariants without changing source data.
 * Intentional cross-entity collisions can be allow-listed by normalized alias.
 */
export function validateLexicon(entries, {
  allowedCollisions = [],
  allowedLanguageKeys = LEXICON_LANGUAGES,
  allowDuplicateCanonicals = false,
} = {}) {
  const errors = [];
  const canonicalOwners = new Map();
  const aliasOwners = new Map();
  const allowedCollisionSet = new Set(allowedCollisions.map(normalizeForMatch));
  const languageSet = new Set(allowedLanguageKeys);

  for (const [entryIndex, entry] of (entries || []).entries()) {
    const canonical = entry?.canonical || entry?.name;
    if (!canonical || !String(canonical).trim()) {
      errors.push(Object.freeze({ kind: 'missingCanonical', entryIndex }));
      continue;
    }

    const canonicalKey = normalizeForMatch(canonical);
    const canonicalAliasOwners = aliasOwners.get(canonicalKey) || new Set();
    canonicalAliasOwners.add(canonical);
    aliasOwners.set(canonicalKey, canonicalAliasOwners);
    if (!allowDuplicateCanonicals && canonicalOwners.has(canonicalKey)) {
      errors.push(Object.freeze({ kind: 'duplicateCanonical', canonical, firstIndex: canonicalOwners.get(canonicalKey), entryIndex }));
    } else if (!canonicalOwners.has(canonicalKey)) {
      canonicalOwners.set(canonicalKey, entryIndex);
    }

    const aliasMap = entry?.aliases;
    if (aliasMap && !Array.isArray(aliasMap) && typeof aliasMap === 'object') {
      for (const key of Object.keys(aliasMap)) {
        if (!languageSet.has(key)) errors.push(Object.freeze({ kind: 'unknownLanguageKey', canonical, key, entryIndex }));
      }
    }

    const aliasMapEntries = aliasMap && !Array.isArray(aliasMap) && typeof aliasMap === 'object'
      ? Object.entries(aliasMap).flatMap(([language, values]) => (Array.isArray(values) ? values : []).map((alias, aliasIndex) => ({ alias, aliasIndex, language })))
      : (Array.isArray(aliasMap) ? aliasMap : []).map((alias, aliasIndex) => ({ alias, aliasIndex, language: null }));
    const localExactAliases = new Map();
    for (const { alias, aliasIndex, language } of aliasMapEntries) {
      if (typeof alias !== 'string' || !alias.trim()) {
        errors.push(Object.freeze({ kind: 'emptyAlias', canonical, aliasIndex, entryIndex, language }));
        continue;
      }
      const normalized = normalizeForMatch(alias) || normalizeUnicode(alias).toLocaleLowerCase().trim();
      if (!normalized) {
        errors.push(Object.freeze({ kind: 'emptyNormalizedAlias', canonical, alias, aliasIndex, entryIndex, language }));
        continue;
      }
      // Search normalization intentionally collapses spelling variants such as
      // ё/е, apostrophe glyphs and hyphen/space forms. Those are useful aliases,
      // not structural duplicates. A duplicate is the same source spelling
      // modulo Unicode normalization, case and whitespace only.
      const rawIdentity = String(alias).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
      const duplicateKey = `${language || '*'}:${rawIdentity}`;
      if (localExactAliases.has(duplicateKey)) {
        errors.push(Object.freeze({ kind: 'duplicateAlias', canonical, alias, normalizedAlias: normalized, firstAliasIndex: localExactAliases.get(duplicateKey), aliasIndex, entryIndex, language }));
      } else {
        localExactAliases.set(duplicateKey, aliasIndex);
      }

      const owners = aliasOwners.get(normalized) || new Set();
      owners.add(canonical);
      aliasOwners.set(normalized, owners);
    }
  }

  for (const [alias, canonicals] of aliasOwners) {
    if (canonicals.size > 1 && !allowedCollisionSet.has(alias)) {
      errors.push(Object.freeze({ kind: 'crossCanonicalCollision', alias, canonicals: Object.freeze([...canonicals]) }));
    }
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function assertValidLexicon(entries, options = {}) {
  const report = validateLexicon(entries, options);
  if (!report.ok) {
    const preview = report.errors.slice(0, 10).map((item) => JSON.stringify(item)).join('; ');
    throw new Error(`Lexicon invariant validation failed (${report.errors.length}): ${preview}`);
  }
  return true;
}

export function aliasesToRegex(values, flags = 'iu') {
  const alternatives = [...new Set(values || [])]
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => normalizeUnicode(value).trim())
    .sort((a, b) => b.length - a.length)
    .map(aliasPattern);
  if (!alternatives.length) throw new TypeError('aliasesToRegex() requires at least one non-empty alias');
  return new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:${alternatives.join('|')})(?:$|[^\\p{L}\\p{N}_])`, flags);
}
