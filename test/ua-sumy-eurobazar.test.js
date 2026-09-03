import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Sumy Eurobazar keeps sourced Ukrainian aliases', () => {
  const eurobazar = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Eurobazar');

  assert.ok(eurobazar);
  assert.equal(eurobazar.category, 'shopping_mall');
  assert.equal(eurobazar.country, 'UA');
  assert.equal(eurobazar.city, 'Sumy');
  assert.deepEqual(eurobazar.aliases.uk, ['Євробазар', 'ТЦ Євробазар']);
  assert.deepEqual(eurobazar.aliases.en, ['Eurobazar']);
});
