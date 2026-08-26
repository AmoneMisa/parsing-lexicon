import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { normalizeForMatch } from '@whiteslove/parsing-lexicon/normalization';
import { locationCities, dictionaryFor } from '@whiteslove/parsing-lexicon/locations';
import { LOCATION_LIST_KEYS } from '@whiteslove/parsing-lexicon/location-merge';
import {
  UA_KATOTTG_LOCATION_ENTRIES,
  UA_KATOTTG_LOCATION_EXTENSIONS,
  UA_KATOTTG_LOCATION_META,
  ukraineKatottgAncestry,
  ukraineKatottgGeocodeCandidates,
} from '../src/ua-katottg-location-extensions.js';

const SETTLEMENT_TYPES = new Set(['special_city', 'city', 'urban_settlement', 'village', 'settlement']);
const ua = locationCities('UA');

function identities(entry) {
  return [...new Set([
    entry?.canonical,
    entry?.name,
    ...(entry?.aliases || []),
  ].map(normalizeForMatch).filter(Boolean))];
}

function parentIdentity(entry) {
  return normalizeForMatch(entry?.parent || entry?.parentCode || entry?.district || '');
}

test('official KATOTTG snapshot uses the canonical location-entry model', () => {
  assert.equal(UA_KATOTTG_LOCATION_META.snapshot, '2026-07-07');
  assert.equal(UA_KATOTTG_LOCATION_META.runtimeDependency, false);
  assert.equal(UA_KATOTTG_LOCATION_META.recordCount, UA_KATOTTG_LOCATION_ENTRIES.length);
  assert.ok(UA_KATOTTG_LOCATION_ENTRIES.length > 30_000);

  const codes = new Set();
  for (const entry of UA_KATOTTG_LOCATION_ENTRIES) {
    assert.ok(entry.canonical);
    assert.equal(entry.name, entry.canonical);
    assert.ok(Array.isArray(entry.aliases));
    assert.ok(entry.aliases.includes(entry.canonical));
    assert.ok(entry.re instanceof RegExp);
    assert.equal(entry.country, 'UA');
    assert.equal(entry.source, 'katottg');
    assert.match(entry.katottgCode, /^UA[0-9A-Z]{17}$/);
    assert.equal(codes.has(entry.katottgCode), false, `duplicate KATOTTG code: ${entry.katottgCode}`);
    codes.add(entry.katottgCode);
  }
});

test('every official settlement is inserted into locationCities without same-name data loss', () => {
  const officialSettlements = UA_KATOTTG_LOCATION_ENTRIES.filter((entry) => SETTLEMENT_TYPES.has(entry.type));
  const extensionSettlements = Object.entries(UA_KATOTTG_LOCATION_EXTENSIONS)
    .filter(([, dictionary]) => dictionary.katottg)
    .map(([key, dictionary]) => [key, dictionary.katottg]);

  assert.equal(extensionSettlements.length, officialSettlements.length);
  assert.equal(new Set(extensionSettlements.map(([, entry]) => entry.katottgCode)).size, officialSettlements.length);

  for (const [key, entry] of extensionSettlements) {
    assert.ok(ua[key], `settlement missing from locationCities(UA): ${key}`);
    assert.equal(ua[key].katottg?.katottgCode, entry.katottgCode, `wrong KATOTTG identity for ${key}`);
  }
});

test('dictionaryFor and locationCities share one Ukrainian source of truth', () => {
  const kyiv = dictionaryFor('UA', 'Kyiv');
  assert.ok(kyiv);
  assert.equal(kyiv.katottg?.katottgCode, ua.Kyiv.katottg?.katottgCode);
  assert.deepEqual(kyiv.districts, ua.Kyiv.districts);
  assert.ok(kyiv.regions?.length > 0);
  assert.ok(kyiv.communities?.length > 0);
  assert.ok(kyiv.districts?.some((entry) => entry.katottgCode));
});

test('curated and KATOTTG aliases collapse to one district identity', () => {
  const merged = (ua.Kyiv?.districts || []).filter((entry) =>
    entry.katottgCode && entry.sources?.includes('katottg') && entry.sources?.includes('curated'));
  assert.ok(merged.length > 0, 'expected at least one Kyiv district to merge curated and KATOTTG identities');

  for (const entry of merged) {
    assert.equal(entry.source, 'curated');
    assert.ok(entry.aliases.length >= 2);
    assert.ok(entry.katottgCode);
  }
});

test('merged UA dictionaries contain no duplicate identity in the same type and parent scope', () => {
  for (const [city, dictionary] of Object.entries(ua)) {
    for (const type of LOCATION_LIST_KEYS) {
      const seen = new Map();
      for (const entry of dictionary?.[type] || []) {
        const parent = parentIdentity(entry);
        for (const identity of identities(entry)) {
          const key = `${parent}\u0000${identity}`;
          const previous = seen.get(key);
          assert.ok(!previous || previous === entry,
            `duplicate UA identity: ${city}/${type}/${parent || '-'}: ${identity}`);
          seen.set(key, entry);
        }
      }
    }
  }
});

test('KATOTTG hierarchy and geocode candidates use the same entry objects', () => {
  const child = UA_KATOTTG_LOCATION_ENTRIES.find((entry) => entry.parentCode);
  assert.ok(child);
  const ancestry = ukraineKatottgAncestry(child);
  assert.ok(ancestry.length >= 2);
  assert.equal(ancestry.at(-1), child);
  assert.equal(ancestry.at(-2)?.katottgCode, child.parentCode);

  const candidates = ukraineKatottgGeocodeCandidates(child);
  assert.ok(candidates.length > 0);
  assert.ok(candidates.every((query) => query.endsWith('Ukraine')));
});

test('parallel ua-geo-set public model is removed', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.exports['./ua-geo-set'], undefined);
});
