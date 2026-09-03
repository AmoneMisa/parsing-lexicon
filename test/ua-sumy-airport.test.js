import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Sumy airport keeps verified local aliases', () => {
  const airport = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Sumy Airport');

  assert.ok(airport);
  assert.equal(airport.category, 'airport');
  assert.equal(airport.country, 'UA');
  assert.equal(airport.city, 'Sumy');
  assert.deepEqual(airport.aliases.uk, ['Аеропорт Суми', 'аеропорт «Суми»', 'Сумський аеропорт']);
  assert.deepEqual(airport.aliases.en, ['Sumy Airport']);
});
