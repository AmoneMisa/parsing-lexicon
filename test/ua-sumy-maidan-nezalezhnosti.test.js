import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Sumy Maidan Nezalezhnosti keeps sourced local naming', () => {
  const square = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Майдан Незалежності');

  assert.ok(square);
  assert.equal(square.category, 'square');
  assert.equal(square.country, 'UA');
  assert.equal(square.city, 'Sumy');
  assert.deepEqual(square.aliases.uk, ['Площа Незалежності']);
});
