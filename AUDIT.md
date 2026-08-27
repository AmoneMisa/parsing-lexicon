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

## Money / Currency / Contact (`src/money*.js`, `currency.js`, `contact.js`) — pending commit

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
- Noted for awareness, not acted on: `escapeRegex()` is duplicated verbatim
  across `normalization.js`, `money-core.js`, and `housing-money.js`.

## Verification approach (all sections)

Every fix was checked against a concrete failing input before and after the
change (not just read for plausibility), and a regression test was added
covering the specific false positive/negative. Full suite: 233 passed, 0
failed after all three sections.

## Not yet covered

Geography/location dictionaries (UA/UZ/KZ/RO alias tables — the largest
remaining part of the codebase, but mostly literal word lists rather than
hand-written parsing regexes, so lower expected bug density).
