# Regex Audit — 2026-08-27

Ongoing correctness/ReDoS/simplification audit of `@whiteslove/parsing-lexicon`'s
regex-heavy parsing modules. Each section below covers one part of the codebase,
checked for the same three things: catastrophic backtracking risk, correctness
bugs (mismatches, unbounded substring matches, wrong negations), and
duplicated/over-complex patterns worth consolidating.

## Housing (`src/housing*.js`) — commit `b125648`

- **`housing-text.js`** — "N qavatli" (Uzbek "an N-storey building") was
  misread as the advertised unit's own floor (`{floor: 8, totalFloors: 8}`
  instead of `{floor: null, totalFloors: 8}`). Fixed the exclusion lookahead
  and added a total-floors-only fallback so the storey count isn't lost.
- **`housing.js`** — `dom` (house) matched as an unbounded 3-letter substring,
  so text containing an unrelated word like "seldom" defeated the ambiguity
  guard for generic Uzbek `uy` (home/room). Bounded it like its Cyrillic
  counterpart `дом` already was.
- **`housing-safety.js`** — dropped a stray `|ту` alternative in the
  single-female-tenant pattern (a non-word typo, confirmed dead against its
  unaffected sibling regex).
- No ReDoS found. Flagged but not acted on: a Unicode word-boundary fragment
  reinvented 5 different ways across housing files (the exact class of drift
  that caused the `dom` bug) — a shared constant would help, deferred as a
  deliberate separate refactor rather than bundled into bug fixes.

## Hiring (`src/hiring*.js`) — commit `ad1d5fd`

- **`hiring-semantics.js`** — `REMOTE_POSITIVE_RE` matched "удаленность"/
  "віддаленості" (an object's *distance*, e.g. from a landmark) as a
  candidate wanting remote work, via unbounded stems and an open `\p{L}*`
  suffix wildcard. Enumerated the real case endings and bounded both stems.
- **`hiring-source-semantics.js`** — `TEMPORARY_WORK_AUTH_RE` matched the
  common English verb "opt" ("opt-in", "opt out") as an OPT/CPT
  work-authorization mention because the check was case-insensitive. "OPT"
  now requires exact case (always capitalized in real postings); "cpt"/
  "stem opt" stay case-insensitive via explicit character classes. Verified
  against the one real consumer (`sample_project`'s job-visa-sponsorship test).
- No ReDoS found — the large profession/skill catalogs go through shared,
  already-safe helpers (`aliasesToRegex`/`buildSkillRegex`).

## Money / Currency / Contact (`src/money*.js`, `currency.js`, `contact.js`) — commit `5e1b28c`

- **`money-core.js`** — `MONEY_RANGE_RE`'s scale-abbreviation groups had no
  token boundary, so "от 2 до 3 месяцев" (a probation period) read the "м" in
  "месяцев" as the million abbreviation and turned 3 into 3,000,000. Fixed by
  nesting the boundary check inside each optional scale group (rather than
  after it), which avoids a second regression: an unboundaried, boundary
  check placed after the group would have broken no-space separators like
  "5до10".
- **`money.js`** — `CONTACT_MARKER_RE` had no leading boundary, so "хостел:"/
  "котел:" (ending in the same letters as "тел", phone) falsely marked a
  following price-like number as a protected phone span and made it
  disappear from salary parsing entirely. Added the missing boundary.
- **`contact.js`** — `parsePrimaryContact`'s keyword-triggered phone regex had
  the same unbounded-suffix problem as `CONTACT_MARKER_RE` above (its own
  sibling regex, `trailing`, already had the correct boundary). Fixed to
  match.
- **`housing-money.js`** — two compounding bugs in the currency-tagged price
  scan (`reNumSym`/`reSymNum`): (1) `PRICE_CURRENCY` had no boundary, so short
  currency codes like `cad`/`ron`/`aed` matched as substrings of unrelated
  words ("100 cadastru" → misread as 100 CAD); (2) fixing that with `\p{L}`/
  `\p{N}` boundary escapes silently did nothing at first, because the two
  regexes using `PRICE_CURRENCY` were compiled with flags `'ig'` instead of
  `'igu'` — Unicode property escapes are no-ops without the `u` flag. Both
  are now fixed together and verified against real currency codes (CAD, RON,
  AED) still matching correctly.
- No ReDoS found — the digit-group/decimal-separator alternatives in
  `MONEY_NUMBER_PATTERN` never overlap, so there's exactly one way to
  tokenize any input.
- `escapeRegex()` now has one canonical implementation in `normalization.js`;
  money, geography, and hiring consumers import/re-export it rather than
  maintaining local copies.

## Geography / locations (`src/geography*.js`, `geo.js`, `locations.js`,
`landmarks.js`, `central-asia*.js`, `ua-*.js`, `kz-location-extensions.js`,
`uz-location-extensions.js`, `romania-geography.js`, `tashkent-*.js`,
`odesa-metropolitan.js`, `ukraine.js`, `country-context.js` — ~3700 lines,
24 files) — pending commit

- **`tashkent-housing-geography.js`** — `DISTRICT_MARKER`'s `туман\p{L}*`
  alternative (Uzbek "district") had an open suffix wildcard, so an unrelated
  word like "туманность" ("cloudiness", or here just "haziness" as a stray
  noun) satisfied `hasExplicitTashkentDistrict()` as if a district had been
  named. Bounded the suffix to `{0,4}` letters — covers real case endings
  (туманда, туманидан) while excluding the 5-letter false positive.
- Everything else in this batch — the actual city/district/metro/landmark
  alias catalogs across all 24 files — routes through the shared
  `aliasesToRegex`/`findCanonical` machinery in `normalization.js`, which
  already enforces boundaries and the `u` flag consistently. No hand-rolled
  bypass regex found for any short alias, and no recurrence of the `u`-flag/
  `\p{...}` mismatch bug found in the money section. This is the
  best-consolidated part of the codebase audited so far — the previously
  flagged word-boundary-reinvented-many-times pattern does not recur here.
- No ReDoS found.

## Verification approach (all sections)

Every fix was checked against a concrete failing input before and after the
change (not just read for plausibility), and a regression test was added
covering the specific false positive/negative. Full suite: 233 passed, 0
failed after all four sections.

## Not yet covered

Nothing regex-relevant remains unaudited in `src/`. `normalization.js` and
`lexicon-core.js` (the shared alias-matching machinery every section above
routes through) were read as part of verifying each section's fixes, but
not independently re-audited end-to-end as their own section.

## Location merge / import startup (`src/location-merge.js`) — 2026-09-12

- **`location-merge.js`** — `mergeEntry` built its result with
  `{ ...existing, ...incoming }`. Object spread invokes getters, so every merged
  location entry's lazy `re` getter ran at merge time, compiling the full alias
  regex set during module load rather than on first match. Importing
  `src/index.js` took 43.6s; it now takes 4.8s. Fixed with an `entryData()`
  helper that copies every field except `re`. Regression test asserts a merge
  compiles zero regexes and that the merged entry still matches aliases from
  every source.
- This also explains the test-suite runtime: each test file paid the same
  43s import cost, and `geo-catalog` paid it too through its pinned dependency.

## Public API repair and parser improvement assessment — 2026-10-26

Baseline: remote master `a1e2476054f9734d041767754c6c2bc000754824`, npm version
`0.10.26`. The fixes prepare version `0.10.27` for the normal CI publishing path.

### Confirmed defects and repairs

- The root's two star exports made `parseHousingAudience` ambiguous: a named
  import failed during ESM linking. The root now explicitly selects the legacy
  scalar function from `housing-text`; the enrichment subpath keeps its existing
  `{ primary, alternatives }` contract.
- `UA_EXTRA_LOCATION_DICTIONARIES` was declared but absent at runtime. Its
  deprecated compatibility export now references `LOCATION_DICTIONARIES.UA`
  directly, without copying or rebuilding a registry.
- 76 existing root values had no declarations. Existing declaration owners are
  re-exported, and public JavaScript modules without declarations now have
  adjacent declarations and explicit `types` entries in the package exports map.
- Checking all 88 entry points found additional drift: `CV_SECTION_HEADINGS`
  and `looksLikeGroupWelcomeMessage` needed declarations;
  `extractHousingPoiRelations` needed its already-declared re-export from the
  enrichment subpath. The stale `HIRING_GLOBAL_CITIES` declaration is removed:
  it had no runtime export, and restoring an obsolete geography catalog name
  would conflict with the repository's existing architecture regression.

`test/public-api-contract.test.js` checks runtime/declaration value-export parity
for every public entry point and critical named-import compatibility. Strict
consumer fixtures live in `test-types/`, outside Node's automatic test directory
discovery. CI and publishing now use the lockfile and run both `npm test` and
`npm run typecheck` on the configured supported Node versions. The pack dry run
contains every configured runtime and declaration entry point.

### Reuse of the supplied human reviews

The original source sets were located through Claude's scratch files in the
existing backend owner, `ml/apartment-encoder/review-hard2/items.json` and
`review-hard3/items.json`. Their IDs match the supplied result exports:
`48df71bb5c` (20 cards) and `dfcd07dce2` (40 cards).

All four inputs are read-only. SHA-256 checks verified that neither source set
nor supplied review export changed. There are 60 distinct IDs, 59 reviewed
non-skipped cards, and one skipped card. All manually selected ranges match
their original text in Unicode code points. Two missed-label flags have no
selected range; these are unknown spans, not negative examples.

`LANDMARK` means a specific named place; `NEARBY` means generic nearby amenities
such as schools or shops. This distinction is retained. The existing
`review_to_training.py` converter was reused in memory for the sv5 exports; its
compatibility projection yields 80 LANDMARK and 59 NEARBY spans. This is the
existing converter's projection, not a new manual annotation. Its casing-based
legacy heuristic is approximate and must not be treated as independent semantic
ground truth, especially for lowercase proper names. No source review or stored
gold file was rewritten. The other projected counts are: ADDRESS 49, COMPLEX 43,
MICRODISTRICT 22, DISTRICT 29, METRO 17, PRICE 45, CURRENCY 40, LOCALITY 27 and
DEPOSIT 4.

The saved prediction verdicts and added selections reveal where to investigate:
25 rejected address predictions with 25 added address selections; 18 rejected
district predictions; 26 added locality selections. These are counts on curated
hard cases, not production precision/recall. The reviews have already been used
in earlier development, so they are a regression corpus, not an untouched
holdout. An independent evaluation needs a separate, deduplicated split.

One concrete error was fixed in the existing Ukrainian wanted-intent grammar:
`Сім'я винайме ... квартиру` now resolves to `propertyWanted`. Future forms
`винайму`/`винаймемо` share the same bounded housing context. Relative clauses
such as `для тих, хто винайме квартиру` remain excluded. A minimal regression
uses no card IDs or contact data.

Replaying the 59 reviewed texts against the baseline and fixed package found
no differences in `parseHousingV2` data/confidence or listing enrichment. Intent
changed on exactly the reviewed family-seeking-rent example, from null to
`rentIn/propertyWanted/longRent`. This demonstrates that fix; it is not a claim
of general accuracy improvement.

The reviews also expose a data-preparation error: one source text already has
its rent amount replaced by `[PHONE]`. No downstream parser can recover the
removed number. That needs a regression in the existing redaction owner;
changing this frozen review text would hide the defect.

### Additional methods worth testing

The package already has lazy shared parse documents and original offsets,
rare-gram alias retrieval, evidence ledgers, a bounded beam resolver, rejection
thresholds, city hypotheses, micro-grammars and offline weight fitting. They
should be reused rather than duplicated behind another parser API.

1. **Address composition and role constraints first.** Extend the existing
   address grammar and token/candidate pipeline for multiple house numbers,
   building qualifiers and bounded address phrases. The review notes give
   concrete examples: multiple suffix numbers, a boulevard plus a building,
   and street phrases with unwanted tails. Resolve price/phone and
   property-location/proximity conflicts using existing semantic spans and
   provenance before accepting candidates. Finite-state composition is a useful
   model for these bounded patterns, not a reason to add a parallel parser
   ([Mohri, 1997](https://aclanthology.org/J97-2003/)). Gate changes on exact span
   boundaries and wrong-role counts, as well as recall.
2. **Constrained sequence decoding in the ML owner.**
   `ml/apartment-encoder/train_spans.py` currently describes its decoder as
   greedy BIO and uses token argmax. A small Viterbi decoder with valid BIO
   transitions is a concrete ablation before training a CRF head. Joint sequence
   decisions are established for NER
   ([Lample et al., 2016](https://aclanthology.org/N16-1030/)). This belongs in
   apartment-encoder, not the deterministic lexicon. It will not by itself fix
   every overlong but valid span; compare exact span F1 and boundary errors on
   independent data before claiming a gain.
3. **Calibrate the existing rejection gates.** Expand the reviewed corpus with
   difficult negatives and source/language diversity, split by duplicate cluster
   and source/time, and evaluate accepted-error rate versus coverage. Reuse
   `fitLogisticWeights`, existing margins and independent-evidence gates. Keep
   heuristic scores distinct from probabilities. The selective-prediction
   literature motivates measuring rejection/coverage, but its formal DNN
   guarantees do not transfer automatically to these heuristic scores
   ([Geifman and El-Yaniv, 2017](https://proceedings.neurips.cc/paper/2017/hash/4a8423d5e91fda00bb7e46540e2b0cf1-Abstract.html)).
4. **Multi-pattern automata only after profiling.** Aho-Corasick can retrieve
   literal aliases in one text pass
   ([Aho and Corasick, 1975](https://par.cse.nsysu.edu.tw/resource/paper/2022/220913/Efficient%20String%20Matching%20an%20Aid%20to%20Bibliographic%20Search.pdf)).
   Preserve city scope, normalization equivalences, original offsets and final
   regex verification. It is not the first priority here: the existing
   4002-street retrieval probe returns only 6 candidates for Shifokorlar, with
   warm p95 about 0.010 ms on this Node 24 run. The synthetic corpus's slowest
   warm cases were CV/ATS, not that street retrieval. Measure cold startup,
   memory and end-to-end latency before replacing the current index.

The existing 20-case synthetic benchmark reports 38 true-positive labels, one
false positive and no false negatives against its fixture gold. These figures
describe that small corpus only. No production metrics, new model training or
unmeasured algorithmic speedup are claimed. Research proposals above remain
separate from the API repair and the demonstrated wanted-intent correction.

Local verification on Node v24.13.1: **1153 tests passed**, strict typecheck
passed, and the actual packed `0.10.27` tarball passed both a fresh consumer's
strict TypeScript compilation and named JavaScript imports. CI is responsible
for the separate Node 20/22/24 matrix; the local result is not that matrix.
