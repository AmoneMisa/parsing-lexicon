import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Sumy meat processing plant keeps verified local names', () => {
  const plant = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === "Сумський м'ясокомбінат");

  assert.ok(plant);
  assert.equal(plant.category, 'landmark');
  assert.equal(plant.country, 'UA');
  assert.equal(plant.city, 'Sumy');
  assert.deepEqual(plant.aliases.uk, ["Сумський м'ясокомбінат", "ВАТ «Сумський м'ясокомбінат»"]);
});
