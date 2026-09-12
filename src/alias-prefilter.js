// Candidate prefilter for alias-backed location/entity lists.
//
// A country dictionary holds tens of thousands of entries, each carrying a
// lazily compiled `re` built by aliasesToRegex(). Scanning a list with
// `entries.find((entry) => entry.re.test(text))` therefore runs one large
// alternation regex per entry — ~14.5k of them for a single Uzbek listing,
// which costs seconds per call and dwarfs every other parsing step.
//
// Almost all of that work is provably wasted. aliasPattern() only relaxes
// *separators* between alias words; the letters and digits of an alias are
// matched literally (modulo the Karakalpak Latin equivalence classes and
// case). So the longest run of letters/digits inside an alias must appear as a
// contiguous substring of the text for that alias to match at all. Indexing
// entries by the first few characters of that run lets a text's own character
// n-grams select the handful of entries worth testing.
//
// The index is a filter, never a verdict: every surviving candidate is still
// matched with its real `re`, in the list's original order, so results are
// identical to a full scan. Folding is deliberately more aggressive than the
// pattern's own equivalences (Cyrillic ё/ў/қ/ғ… are collapsed): over-merging
// can only admit extra candidates, never discard a real match.

import { normalizeUnicode } from './normalization.js';

const GRAM = 4;

const PREFILTER_FOLD = Object.freeze({
  // Karakalpak Latin equivalences aliasPattern() encodes as character classes.
  á: 'a', ǵ: 'g', ı: 'i', ń: 'n', ó: 'o', ú: 'u',
  // Safe over-merging: these only widen the candidate set.
  ё: 'е', ў: 'у', қ: 'к', ғ: 'г', ҳ: 'х', ә: 'а', і: 'и',
  ң: 'н', ө: 'о', ұ: 'у', ү: 'у', һ: 'х', є: 'е', ї: 'и', ґ: 'г',
});

const NON_ALNUM_RE = /[^\p{L}\p{N}]+/u;

function fold(value) {
  let out = '';
  for (const char of normalizeUnicode(value).toLocaleLowerCase()) {
    out += PREFILTER_FOLD[char] ?? char;
  }
  return out;
}

/** The first GRAM characters of an alias's longest literal run, or null. */
function aliasGram(alias) {
  let longest = '';
  for (const run of fold(alias).split(NON_ALNUM_RE)) {
    if (run.length > longest.length) longest = run;
  }
  return longest.length >= GRAM ? longest.slice(0, GRAM) : null;
}

/** Every GRAM-length window of the folded text. */
function textGrams(text) {
  const folded = fold(text);
  const grams = new Set();
  for (let i = 0; i + GRAM <= folded.length; i += 1) {
    grams.add(folded.slice(i, i + GRAM));
  }
  return grams;
}

function buildIndex(entries) {
  const byGram = new Map();
  // Entries whose every alias is shorter than GRAM cannot be indexed, so they
  // are always tested. In practice this is a tiny tail.
  const always = [];

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const aliases = entry?.aliases?.length ? entry.aliases : [entry?.name].filter(Boolean);
    const grams = [];
    let indexable = aliases.length > 0;

    for (const alias of aliases) {
      const gram = aliasGram(alias);
      if (!gram) {
        indexable = false;
        break;
      }
      grams.push(gram);
    }

    if (!indexable) {
      always.push(i);
      continue;
    }
    for (const gram of new Set(grams)) {
      const bucket = byGram.get(gram);
      if (bucket) bucket.push(i);
      else byGram.set(gram, [i]);
    }
  }

  return { byGram, always };
}

const INDEX_CACHE = new WeakMap();

function indexFor(entries) {
  let index = INDEX_CACHE.get(entries);
  if (!index) {
    index = buildIndex(entries);
    INDEX_CACHE.set(entries, index);
  }
  return index;
}

/**
 * First entry in `entries` whose alias regex matches `text`.
 *
 * Equivalent to `entries.find((entry) => entry.re.test(text))`, including the
 * "first in list order wins" tie-break, but only compiles and runs the regexes
 * of entries the text could plausibly contain.
 */
export function matchFirstEntry(entries, text) {
  if (!Array.isArray(entries) || !entries.length) return undefined;
  const value = String(text || '');
  if (!value) return undefined;

  const { byGram, always } = indexFor(entries);
  const candidates = new Set(always);
  for (const gram of textGrams(value)) {
    const bucket = byGram.get(gram);
    if (!bucket) continue;
    for (const i of bucket) candidates.add(i);
  }
  if (!candidates.size) return undefined;

  for (const i of [...candidates].sort((a, b) => a - b)) {
    const entry = entries[i];
    if (entry?.re?.test(value)) return entry;
  }
  return undefined;
}
