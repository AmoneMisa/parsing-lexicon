# @whiteslove/parsing-lexicon

Deterministic multilingual parsing primitives shared by Whiteslove housing and hiring services.

The package is the canonical home for lexical data, normalization and reusable deterministic extraction. It is intentionally network-free and does **not** contain UI copy, persistence rules, source orchestration or consumer-specific business logic.

## What it covers

### Geography

- Countries and multilingual aliases for the markets used by Whiteslove services.
- Canonical city, region, district, microdistrict, locality and metro matching.
- Uzbekistan and Kazakhstan location extensions.
- Ukraine city/region catalog with current and historical names, major/regional city detail and metro/location extensions.
- Tashkent districts, metro, colloquial areas, residential complexes and POIs.
- Odesa metropolitan entities with separate administrative, suburb/locality, informal-area, development-area, POI and search-cluster semantics.
- Normalization for apostrophe/dash variants and Cyrillic search folding across RU/UZ/KZ/UA input.

### Housing

- Deal/action and listing-kind taxonomy.
- Property/building type, condition, layout, furniture and listing-status context.
- Rooms, bedrooms, floors, total floors, building year and area extraction.
- Deposit, prepayment, utilities and commission/payment context.
- Seller/agency/owner confidence and no-commission semantics.
- Tenant policies, documents, financing, availability and location relations.
- Infrastructure/proximity extraction such as walking time to metro.

### Hiring

- Candidate vs vacancy intent and non-content/spam classification.
- Section-aware vacancy/CV parsing.
- Profession taxonomy and profession context without duplicating consumer technology-skill catalogs.
- Salary range, currency and pay-period extraction.
- Experience requirements and seniority.
- Work mode, employment types, schedules and probation.
- Languages, CEFR levels and requirement relation (`required`, `preferred`, `notRequired`, `candidateHas`).
- Work authorization, visa sponsorship, relocation, contracts, benefits and hiring status context.

## Architecture

Consumers should resolve data in this order:

```text
structured source fields
  -> shared canonical lexicon
  -> deterministic parser
  -> AI fallback / enrichment
```

Lexical aliases belong here. Consumers keep source adapters, persistence, ranking/filtering semantics and UI/API contracts.

The package must remain dependency-light and must never require a runtime lexicon HTTP service, Redis or a message broker.

## Usage

```js
import {
  canonicalCity,
  canonicalTashkentMetro,
  normalizeForMatch,
  parseHousingStructured,
  parseHiringContext,
  parseHiringSalary,
} from '@whiteslove/parsing-lexicon';

canonicalCity('Қарағанды', 'KZ');
// Karaganda

canonicalTashkentMetro('метро Максим Горький');
// Buyuk Ipak Yoli

normalizeForMatch('Oʻzbekiston');
// o zbekiston

parseHousingStructured('3 xona, 5/9, 78 m², depozit 500$, metroga 5 minut piyoda');

parseHiringSalary('Salary: $3,000–4,500 per month');

parseHiringContext(
  'Senior Frontend Engineer. English B2 required. Remote. Visa sponsorship available.',
  { mode: 'vacancy', title: 'Senior Frontend Engineer' },
);
```

Subpath exports are available for consumers that need narrower modules, including `./geo`, `./locations`, `./housing-context`, `./housing-structured`, `./hiring-context`, `./hiring-professions` and `./money`.

## Data-quality rules

- Add aliases to the existing canonical entity instead of creating source-specific regex tables.
- Keep administrative entities distinct from colloquial/search concepts.
- Preserve ambiguity guards where a bare term can mean several things.
- Structured source fields take precedence over inferred values.
- Add a regression for every production parsing bug.
- Canonical dictionaries are immutable at runtime.
- Duplicate canonical/alias entries and unsupported language-key drift are covered by invariants.

## Development

Requires Node.js 20+.

```bash
npm install
npm test
npm pack
```

`npm pack` produces the distributable `@whiteslove/parsing-lexicon` tarball from the files declared in `package.json`.
