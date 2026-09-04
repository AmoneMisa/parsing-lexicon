import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Cherkasy railway station keeps sourced non-city aliases', () => {
  const station = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Cherkasy Railway Station');

  assert.ok(station);
  assert.equal(station.category, 'transport');
  assert.equal(station.country, 'UA');
  assert.equal(station.city, 'Cherkasy');
  assert.deepEqual(station.aliases.uk, ['залізничний вокзал Черкаси', 'вокзал Черкаси', 'станція Черкаси']);
  assert.deepEqual(station.aliases.ru, ['железнодорожный вокзал Черкассы']);
  assert.deepEqual(station.aliases.en, ['Cherkasy railway station']);
  assert.ok(!station.aliases.uk.includes('Черкаси'));
});
