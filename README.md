# @whiteslove/parsing-lexicon

Shared deterministic dictionaries and normalization helpers for Whiteslove parsers.

The package is intentionally **not** an interface/i18n package and does not contain service business logic. It owns canonical lexical data used before semantic/AI enrichment.

## Scope

- Uzbek: Latin and Cyrillic spellings, including apostrophe variants.
- Russian and English aliases used in UZ/KZ listings and CV/job posts.
- Kazakh Cyrillic vocabulary and city names.
- UZ/KZ cities, Tashkent districts, areas and metro stations.
- Housing: address markers, deal/property types, rooms/floors/area, currencies, seller/commission, amenities and tenant terms.
- Hiring: candidate/employer intent, CV field labels, work mode, employment type, seniority and common professions.

## Usage

```js
import {
  canonicalCity,
  canonicalTashkentMetro,
  normalizeForMatch,
  DEAL_TYPES,
  findCanonical,
} from '@whiteslove/parsing-lexicon';

canonicalCity('Қарағанды', 'KZ'); // Karaganda
canonicalTashkentMetro('метро Максим Горький'); // Buyuk Ipak Yoli
normalizeForMatch('Oʻzbekiston'); // o zbekiston
findCanonical('жалға беріледі', DEAL_TYPES)?.canonical; // longRent
```

## Architecture rule

Consumers should prefer:

`structured source fields -> shared canonical lexicon -> deterministic parser -> AI fallback/enrichment`

The package must remain network-free and dependency-light. Runtime parsing must never depend on a lexicon HTTP service.

## Adding aliases

Add aliases to the canonical entity instead of introducing source-specific regex tables. Add a regression test for every production parsing bug, especially for Uzbek Latin/Cyrillic or Kazakh input.

```bash
npm test
```
