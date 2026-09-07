# Country-aware housing parsing plan

This branch keeps one shared parser core and adds country-specific profiles only where local notation changes semantics.

## Goals
- No duplicated country parsers.
- Preserve shared money/contact/housing logic.
- Feed canonical country context into ambiguous parsers.
- Mask structural spans (phones, measurements, microdistricts) before money extraction.
- Allow country rules to narrow ambiguous aliases without forking the parser.
- Prefer explicit semantic intent over price heuristics.

## Architecture
1. `countryContext()` remains the canonical country/currency/phone context source.
2. `housing-parser-profile.js` exposes immutable per-country parsing profiles with a common default.
3. `housing-money.js` accepts either the legacy currency string or an options object `{ country, currency }`.
4. The money parser masks phone spans, per-square-meter prices, and country-aware housing measurement/microdistrict spans before multiplier/fallback money parsing.
5. Country profiles only declare ambiguous local rules; all extraction remains in shared code.
6. Production regressions are covered with exact listing text.

## Initial country rules
- UA: mask `N м`, `N м²`, `N м2` in area contexts and `N м/р` microdistrict notation; never let those spans become million-price candidates.
- UZ: retain shared explicit `mln/млн/million` and `ming/минг` handling; avoid introducing single-letter country-specific money aliases.
- Other countries: use the common profile until a real production ambiguity requires an override.

## Backend integration
The Flat Finder backend should pass canonical country context into lexicon money parsing and should never overwrite an explicit long-rent classification with a sale price-floor heuristic.
