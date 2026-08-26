import test from 'node:test';
import assert from 'node:assert/strict';

import {
  UZ_CITY_COORDINATES,
  UZ_LOCATION_COORDINATES,
  uzbekistanCityCoordinates,
  uzbekistanCityGeocodeCandidates,
  uzbekistanLocationCoordinates,
  uzbekistanLocationGeocodeCandidates,
  uzbekistanCoordinateFallback,
} from '@whiteslove/parsing-lexicon/uz-geo-coordinates';
import { UZ_CITY_CATALOG, canonicalUzbekistanCity } from '../src/central-asia.js';

test('Uzbekistan coordinates cover the canonical city catalog with lat/lng points', () => {
  assert.equal(Object.keys(UZ_CITY_COORDINATES).length, UZ_CITY_CATALOG.length);
  for (const city of UZ_CITY_CATALOG) {
    const coords = UZ_CITY_COORDINATES[city.canonical];
    assert.ok(coords, `missing coordinate for ${city.canonical}`);
    assert.equal(canonicalUzbekistanCity(city.canonical), city.canonical);
    assert.deepEqual(Object.keys(coords).sort(), ['lat', 'lng']);
    assert.ok(Number.isFinite(coords.lat), `${city.canonical} lat must be finite`);
    assert.ok(Number.isFinite(coords.lng), `${city.canonical} lng must be finite`);
    assert.ok(coords.lat >= 37 && coords.lat <= 46, `${city.canonical} latitude outside Uzbekistan bounds`);
    assert.ok(coords.lng >= 56 && coords.lng <= 74, `${city.canonical} longitude outside Uzbekistan bounds`);
  }
});

test('Uzbek, Cyrillic and Russian aliases resolve to canonical city coordinates', () => {
  assert.deepEqual(uzbekistanCityCoordinates('Toshkent'), UZ_CITY_COORDINATES.Tashkent);
  assert.deepEqual(uzbekistanCityCoordinates('Самарқанд'), UZ_CITY_COORDINATES.Samarkand);
  assert.deepEqual(uzbekistanCityCoordinates('Фергана'), UZ_CITY_COORDINATES.Fergana);
  assert.deepEqual(uzbekistanCityCoordinates('Urganch'), UZ_CITY_COORDINATES.Urgench);
  assert.deepEqual(uzbekistanCityCoordinates('Qo‘qon'), UZ_CITY_COORDINATES.Kokand);
});

test('city geocoding prefers local canonical spelling when the catalog has one', () => {
  assert.deepEqual(uzbekistanCityGeocodeCandidates('Самарканд'), [
    'Samarqand, Uzbekistan',
    'Samarkand, Uzbekistan',
  ]);
  assert.deepEqual(uzbekistanCityGeocodeCandidates('Ташкент'), ['Tashkent, Uzbekistan']);
});

test('expanded Uzbekistan location dictionaries produce scoped geocoding candidates', () => {
  const candidates = uzbekistanLocationGeocodeCandidates('Самарканд', 'local_area', 'Регистан');
  assert.ok(candidates.includes('Registon, Samarqand, Uzbekistan'));
  assert.ok(candidates.includes('Registon, Samarkand, Uzbekistan'));
});

test('unanchored internal entities safely fall back to the canonical city centre', () => {
  assert.deepEqual(UZ_LOCATION_COORDINATES, {});
  assert.equal(uzbekistanLocationCoordinates('Самарканд', 'local_area', 'Регистан'), null);
  assert.deepEqual(uzbekistanCoordinateFallback('Самарканд', 'local_area', 'Регистан'), {
    ...UZ_CITY_COORDINATES.Samarkand,
    accuracy: 'city',
    source: 'city',
  });
});
