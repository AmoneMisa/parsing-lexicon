import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Sumy State University keeps sourced Ukrainian and English aliases', () => {
  const university = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Sumy State University');

  assert.ok(university);
  assert.equal(university.category, 'university');
  assert.equal(university.country, 'UA');
  assert.equal(university.city, 'Sumy');
  assert.deepEqual(university.aliases.uk, ['Сумський державний університет', 'СумДУ']);
  assert.deepEqual(university.aliases.en, ['SumDU']);
});
