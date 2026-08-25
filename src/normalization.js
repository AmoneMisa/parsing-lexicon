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

/**
 * Search-only companion form that treats an omitted apostrophe as equivalent
 * to Uzbek/Karakalpak apostrophe spellings (Qo'qon/Qoqon, G'azalkent/Gazalkent).
 * Canonical spelling is never changed by this helper.
 */
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
  // Russian/common Cyrillic
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  // Uzbek Cyrillic
  ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
  // Kazakh Cyrillic
  ә: 'a', і: 'i', ң: 'ng', ө: 'o', ұ: 'u', ү: 'u', һ: 'h',
  // Ukrainian characters may occur in mixed datasets
  є: 'ye', ї: 'yi', ґ: 'g',
});

/**
 * Search-oriented Cyrillic folding. This is intentionally not a linguistic
 * transliterator; canonical identity must still come from explicit aliases.
 */
export function foldCyrillicForSearch(value) {
  return normalizeUnicode(value)
    .toLocaleLowerCase()
    .split('')
    .map((char) => CYRILLIC_SEARCH_MAP[char] ?? char)
    .join('');
}

export function normalizedAliasKeys(value) {
  const forms = [value, foldCyrillicForSearch(value)];
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

export function buildAliasIndex(entries) {
  const index = new Map();
  for (const entry of entries || []) {
    const values = [entry.canonical, entry.name, ...aliasesOf(entry)].filter(Boolean);
    for (const value of values) {
      for (const key of normalizedAliasKeys(value)) {
        if (!index.has(key)) index.set(key, entry);
      }
    }
  }
  return index;
}

export function findCanonical(value, entries, { partial = false } = {}) {
  if (!value) return null;
  const index = buildAliasIndex(entries);
  for (const key of normalizedAliasKeys(value)) {
    const exact = index.get(key);
    if (exact) return exact;
  }
  if (!partial) return null;

  const textKeys = normalizedAliasKeys(value);
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

export function aliasesToRegex(values, flags = 'iu') {
  const alternatives = [...new Set(values || [])]
    .filter(Boolean)
    .map((value) => normalizeUnicode(value).trim())
    .sort((a, b) => b.length - a.length)
    .map((value) => escapeRegex(value).replace(/[\s\-–—'’‘`ʻʼ]+/g, "[\\s\\-–—'’‘`ʻʼ]*"));
  return new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:${alternatives.join('|')})(?:$|[^\\p{L}\\p{N}_])`, flags);
}
