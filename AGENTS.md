# AI / Contributor Architecture Rules

This file is mandatory reading before changing parsing, geography, location dictionaries, or public exports in this repository.

## Repository workflow

Do not merge any pull request into `master` without explicit user approval in the current task/conversation. Preparing a branch or PR is allowed; merging is not.

When a PR is approved for merge, use **squash merge only**. Do not use merge commits or rebase-merge for repository changes.

Do not add temporary technical artifacts to the repository: scratch files, migration notes, generated reports, debug scripts, one-off helper files, duplicate documentation, or staging files. Only commit files that belong to the intended architecture or were explicitly requested.

## Core rules

Preserve the existing architecture. Do not solve a data-coverage task by introducing a parallel dictionary, a second merge path, a new public API, or a new file hierarchy unless the current architecture genuinely cannot represent the data correctly.

Prefer the simplest change that fits the current architecture. Do not add abstractions, wrappers, indirection, compatibility layers, helper modules, or files unless they have a concrete architectural responsibility and remove more complexity than they add.

Do not duplicate data. One entity/data set must have one canonical owner. Other layers consume or reference that owner; they must not copy/redeclare the same dataset or rebuild an equivalent registry.

The canonical location shape is:

`country -> city -> location collections`

The public canonical registry is `LOCATION_DICTIONARIES` from `src/locations.js`.

## Coordinates are out of scope

This package is a parsing lexicon. It must not own geographic coordinates.

The canonical coordinates/geography package is:

**https://github.com/AmoneMisa/geo-catalog**

Do not add latitude/longitude, bounding boxes, map points, geocoding coordinates, or coordinate catalogs to `parsing-lexicon`.

Coordinates belong strictly in `AmoneMisa/geo-catalog`. Keep lexical aliases and parsing entities here; keep coordinate data there. Never duplicate coordinate data between packages.

If a task requires both alias parsing and coordinates, add/resolve the canonical lexical entity in this package and connect it to `geo-catalog` at the consumer/application layer. Do not embed coordinates here as a shortcut.

## Location ownership

`src/locations.js` is an aggregator/facade. It must remain small and must not become a city-data dump again.

Country/city data belongs in the existing country-specific sources:

- Kazakhstan: `src/kz-location-extensions.js`
- Uzbekistan: `src/uz-location-extensions.js`
- Ukraine major cities: `src/ua-location-extensions-major.js`
- Ukraine regional cities: `src/ua-location-extensions-regional.js`
- Ukraine secondary cities: `src/ua-secondary-cities.js`
- Ukraine metro additions: `src/ua-location-extensions-metro.js`
- Romania-specific geography extensions: use the existing Romania modules rather than creating a parallel registry.

`src/location-data.js` is a legacy seed / compatibility data layer. Do not add new KZ, UZ, or UA coverage there when an existing country-specific source can represent it.

Matcher/consumer modules such as `src/central-asia-locations.js` must consume `LOCATION_DICTIONARIES`. They must not merge country extension dictionaries again.

## Canonical names and aliases

Each real entity has one current canonical owner.

Historical, renamed, Russian/Ukrainian/Uzbek/Kazakh spellings, transliterations, abbreviations, colloquial forms, and common misspellings belong in `aliases` of the current canonical entity whenever they refer to the same entity.

Do not keep an obsolete name as a second canonical entity after a rename unless it is genuinely a separate current entity.

Example: the former Zaporizhzhia `Komunarskyi` district is an alias of current `Kosmichnyi`, not a second district.

Do not classify informal neighborhoods, residential areas, landmarks, or planning zones as administrative `districts` merely because listings call them a "район". Use the correct existing collection such as `microdistricts`, `localAreas`, `landmarks`, `suburbs`, or `residentialComplexes`.

## Existing constructors and merge behavior

Reuse the existing constructors/helpers:

- `locationEntry()` / `locationEntries()`
- `mergeLocationEntries()`
- `mergeLocationCityDictionaries()`
- `mergeLocationCountries()`

Do not introduce another merge implementation for the same location model.

Preserve parent/district metadata when present. Repeated local names in different parent scopes must remain separately scoped rather than being flattened incorrectly.

## Public API

Do not add exports "just in case".

Prefer extending existing public objects/functions. Keep compatibility exports only when existing consumers may depend on them.

A data-coverage change should normally require no public API change.

If a public export is deprecated, keep compatibility deliberately and document the canonical replacement.

## Files and complexity

Do not create extra files for small data additions. Put data into the existing country/city source that owns it.

Create a new file only when it establishes a meaningful architectural boundary or the existing file has a clearly different responsibility. Never create a file solely to avoid editing the correct existing module.

Do not create per-city files unless the repository is explicitly migrated to that model. The current architecture uses country-specific sources containing city-keyed dictionaries.

Do not create duplicate `v2`, `expanded`, `full`, `combined`, or `normalized` datasets when the canonical registry can be consumed directly. Compatibility export names may remain, but they should reference the canonical data rather than maintain another copy.

Avoid speculative generalization. If one existing helper solves the task, use it instead of creating a framework around it.

## Geography catalogs vs location dictionaries

Do not conflate city catalogs with city-local location data.

- `CITIES`, `CITIES_BY_COUNTRY`, `canonicalCity()` and related geography catalogs identify cities/countries/regions.
- `LOCATION_DICTIONARIES[country][city]` contains districts, microdistricts, mahallas, metro, streets, landmarks, residential complexes, etc.

A new city alias belongs in the geography catalog. A district/microdistrict/metro/POI belonging to that city belongs in the location dictionary.

Neither layer owns coordinates.

## Tests required

Every architecture or location change must keep `npm test` green.

For architecture changes, add regression assertions that protect the architectural invariant, not only one sample string. Examples:

- consumer registries are the same object as canonical `LOCATION_DICTIONARIES` country registries rather than re-merged copies;
- renamed entities resolve to one current canonical;
- aliases still resolve after moving data;
- parent-scoped duplicate names remain scoped;
- public compatibility functions still return the canonical city dictionary;
- no second copy of a country/city registry is introduced.

CI currently tests supported Node versions through the repository workflow. Do not propose a merge while that matrix is failing.

## Before editing

Before making a change, inspect the current `master` and answer these questions internally:

1. Which existing country/city source owns this data?
2. Is there already a constructor/merge helper for this shape?
3. Am I creating duplicate canonical ownership or duplicate data?
4. Am I adding a second aggregation path instead of using `LOCATION_DICTIONARIES`?
5. Can this be implemented without new files, exports, abstractions, or wrappers?
6. Am I accidentally adding coordinate data that belongs in `AmoneMisa/geo-catalog`?
7. Am I introducing a temporary technical file that does not belong to the architecture?
8. Which regression test will prevent the old architecture/problem from returning?

If the answer reveals a conflict with this file, preserve the architecture first and then add the requested coverage.

## Updating this document

When the repository architecture is intentionally changed, update `AGENTS.md` in the same PR so future AI agents and contributors follow the new canonical structure.
