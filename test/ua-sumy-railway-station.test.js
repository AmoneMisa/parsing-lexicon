import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Sumy railway station keeps sourced non-city aliases', () => {
  const station = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Sumy Railway Station');

  assert.ok(station);
  assert.equal(station.category, 'transport');
  assert.equal(station.country, 'UA');
  assert.equal(station.city, 'Sumy');
  assert.deepEqual(station.aliases.uk, ['Суми (станція)', 'залізничний вокзал Суми', 'вокзал станції Суми']);
  assert.deepEqual(station.aliases.en, ['Sumy railway station']);
  assert.ok(!station.aliases.uk.includes('Суми'));
});
