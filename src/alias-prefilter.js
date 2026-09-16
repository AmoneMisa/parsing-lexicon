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
// case). So every maximal run of letters/digits inside an alias must appear as
// a contiguous substring of the text for that alias to match at all. That is
// the invariant the whole index rests on.
//
// The index is a filter, never a verdict: every surviving candidate is still
// matched with its real `re`, in the list's original order, so results are
// identical to a full scan. Folding is deliberately more aggressive than the
// pattern's own equivalences (Cyrillic ё/ў/қ/ғ… are collapsed): over-merging
// can only admit extra candidates, never discard a real match.
//
// Indexing is per alias, not per entry. An entry whose aliases include one
// short string used to fall out of the index entirely and be tested against
// every text; now each alias is indexed on its own terms, so a single short
// alias costs only that alias, never the whole entry. Bucket keys are chosen
// by rarity: of the grams an alias could be filed under, the one appearing in
// the fewest aliases wins, which keeps buckets small where the vocabulary is
// dense. Surviving candidates are then verified by exact substring containment
// of every run, which is cheap and admits almost nothing spurious.

import { normalizeUnicode } from './normalization.js';

const GRAM = 4;
/** Runs shorter than GRAM are looked up against every text substring of the
 * same length, so this bounds how many such sets a query builds. */
const MAX_SHORT = GRAM - 1;

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

/** Maximal literal runs of an alias, folded. Each must appear verbatim in the
 * text for the alias to match, which is what makes them safe filter keys. */
function aliasRuns(alias) {
  return fold(alias).split(NON_ALNUM_RE).filter(Boolean);
}

function* windows(run) {
  for (let i = 0; i + GRAM <= run.length; i += 1) yield run.slice(i, i + GRAM);
}

/** Every GRAM-length window of the folded text, plus the shorter substrings a
 * short alias needs. Both are needed because an alias run of two characters
 * cannot be found in a set of four-character windows. */
function textIndex(text) {
  const folded = fold(text);
  const grams = new Set();
  for (let i = 0; i + GRAM <= folded.length; i += 1) grams.add(folded.slice(i, i + GRAM));
  const shorts = new Set();
  for (let size = 1; size <= MAX_SHORT; size += 1) {
    for (let i = 0; i + size <= folded.length; i += 1) shorts.add(folded.slice(i, i + size));
  }
  return { folded, grams, shorts };
}

function buildIndex(entries) {
  // Pass one counts how many aliases could be filed under each gram, so pass
  // two can file every alias under its rarest option.
  const frequency = new Map();
  const prepared = [];
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const aliases = entry?.aliases?.length ? entry.aliases : [entry?.name].filter(Boolean);
    for (const alias of aliases) {
      const runs = aliasRuns(alias);
      if (!runs.length) { prepared.push({ index: i, runs: null }); continue; }
      const longest = runs.reduce((best, run) => (run.length > best.length ? run : best), '');
      const options = longest.length >= GRAM ? [...windows(longest)] : [longest];
      for (const option of options) frequency.set(option, (frequency.get(option) ?? 0) + 1);
      prepared.push({ index: i, runs, options, short: longest.length < GRAM });
    }
  }

  const byGram = new Map(); const byShort = new Map(); const always = new Set();
  for (const alias of prepared) {
    if (!alias.runs) { always.add(alias.index); continue; }
    let key = alias.options[0];
    for (const option of alias.options) if (frequency.get(option) < frequency.get(key)) key = option;
    const target = alias.short ? byShort : byGram;
    const bucket = target.get(key);
    const ref = { index: alias.index, runs: alias.runs };
    if (bucket) bucket.push(ref); else target.set(key, [ref]);
  }
  return { byGram, byShort, always: [...always].sort((a, b) => a - b) };
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
 * Text-side index for `text`, precomputed once for reuse across lists. The
 * returned value is opaque: pass it straight back to `candidateEntries`.
 */
export function computeTextGrams(text) {
  return textIndex(String(text || ''));
}

/** Accepts an opaque index or, for older callers, a bare Set of grams. */
function resolveTextIndex(value, text) {
  if (value && value.grams instanceof Set) return value;
  if (value instanceof Set) return { ...textIndex(text), grams: value };
  return textIndex(text);
}

function candidateIndices(entries, value, provided) {
  const { byGram, byShort, always } = indexFor(entries);
  const { folded, grams, shorts } = resolveTextIndex(provided, value);
  const candidates = new Set(always);
  const consider = (refs) => {
    if (!refs) return;
    for (const ref of refs) {
      if (candidates.has(ref.index)) continue;
      // Exact containment of every run. The bucket only proposed this alias;
      // this is what makes the proposal almost always correct.
      let ok = true;
      for (const run of ref.runs) if (!folded.includes(run)) { ok = false; break; }
      if (ok) candidates.add(ref.index);
    }
  };
  for (const gram of grams) consider(byGram.get(gram));
  if (byShort.size) for (const short of shorts) consider(byShort.get(short));
  return [...candidates].sort((a, b) => a - b);
}

/**
 * Every entry in `entries` (original list order) the text could plausibly
 * contain, per the index — a filter, not a verdict. Callers still run their
 * own verification (regex, exact-token match, ...) on what comes back; see the
 * module doc for why this is safe even for non-regex verifiers.
 *
 * `grams`, from `computeTextGrams()`, lets a caller scanning the same text
 * against many lists compute the O(text length) text pass once instead of
 * once per list.
 */
export function candidateEntries(entries, text, grams) {
  if (!Array.isArray(entries) || !entries.length) return [];
  const value = String(text || '');
  if (!value) return [];

  return candidateIndices(entries, value, grams).map((i) => entries[i]);
}

/**
 * First entry in `entries` whose alias regex matches `text`.
 *
 * Equivalent to `entries.find((entry) => entry.re.test(text))`, including the
 * "first in list order wins" tie-break, but only compiles and runs the regexes
 * of entries the text could plausibly contain.
 *
 * `accept(entry, matchedText)` optionally vets each hit before it wins. It
 * receives the substring the alias regex actually matched, which is what a
 * caller needs to tell a genuine name from an alias that merely repeats some
 * other place's name; rejecting a hit continues the scan rather than ending it.
 */
export function matchFirstEntry(entries, text, accept) {
  if (!Array.isArray(entries) || !entries.length) return undefined;
  const value = String(text || '');
  if (!value) return undefined;

  for (const i of candidateIndices(entries, value)) {
    const entry = entries[i];
    // `re` carries no /g flag, so exec() is stateless and safe to reuse here.
    const match = entry?.re?.exec(value);
    if (!match) continue;
    if (accept && !accept(entry, match[0])) continue;
    return entry;
  }
  return undefined;
}
