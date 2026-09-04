import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Sumy bus station keeps verified local aliases', () => {
  const station = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Sumy Bus Station');

  assert.ok(station);
  assert.equal(station.category, 'bus_station');
  assert.equal(station.country, 'UA');
  assert.equal(station.city, 'Sumy');
  assert.deepEqual(station.aliases.uk, ['Автовокзал Суми', 'Сумський автовокзал', 'автовокзал на Степана Бандери']);
  assert.deepEqual(station.aliases.ru, ['автовокзал Сумы']);
  assert.deepEqual(station.aliases.en, ['Sumy Bus Station']);
});
