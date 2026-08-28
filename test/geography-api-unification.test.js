import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/index.js';
import * as geoCompat from '../src/geo.js';
import * as geography from '../src/geography.js';

test('one canonical city catalog covers all supported geography countries', () => {
  assert.equal(api.CITIES, geography.CITIES);
  assert.equal(api.canonicalCity('Київ'), 'Kyiv');
  assert.equal(api.canonicalCity('Алматы'), 'Almaty');
  assert.equal(api.canonicalCity('București'), 'Bucharest');
  assert.equal(api.canonicalCity('Ош'), 'Osh');
});

test('country partitions use the canonical catalog', () => {
  assert.ok(api.CITIES_BY_COUNTRY.UA.some(({ canonical }) => canonical === 'Kyiv'));
  assert.ok(api.CITIES_BY_COUNTRY.UZ.some(({ canonical }) => canonical === 'Tashkent'));
  assert.ok(api.CITIES_BY_COUNTRY.KZ.some(({ canonical }) => canonical === 'Almaty'));
});

test('legacy geography names and geo subpath delegate to canonical ownership', () => {
  assert.equal(geography.GEOGRAPHY_CITIES, geography.CITIES);
  assert.equal(geography.GEOGRAPHY_CITIES_BY_COUNTRY, geography.CITIES_BY_COUNTRY);
  assert.equal(geography.canonicalAnyCity('Чернівці'), geography.canonicalCity('Чернівці'));
  assert.equal(geoCompat.CITIES, geography.CITIES);
  assert.equal(geoCompat.CITIES_BY_COUNTRY, geography.CITIES_BY_COUNTRY);
  assert.equal(geoCompat.canonicalCity('Самарканд'), 'Samarkand');
});

test('presentation names localize Ukraine canonical keys without changing storage values', () => {
  assert.equal(api.geographyDisplayName('Dubno', 'ru', 'city'), 'Дубно');
  assert.equal(api.geographyDisplayName('Industrialnyi', 'ru', 'district'), 'Индустриальный');
  assert.equal(api.geographyDisplayName('Tsukrovyi', 'ru', 'microdistrict'), 'Сахарный');
});
