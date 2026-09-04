import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Cherkasy Central Market stays city-scoped and canonicalized', () => {
  const entry = HOUSING_POI_EXTENSIONS.find((item) => item.canonical === 'Cherkasy Central Market');

  assert.ok(entry);
  assert.equal(entry.category, 'market');
  assert.equal(entry.country, 'UA');
  assert.equal(entry.city, 'Cherkasy');
  assert.deepEqual(entry.aliases.uk, ['Центральний ринок', 'Центральний ринок Черкаси', 'Черкаський центральний ринок']);
  assert.deepEqual(entry.aliases.en, ['Cherkasy Central Market']);
  assert.equal(entry.aliases.uk.includes('Черкаси'), false);
});
