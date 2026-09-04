import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Cherkasy Dnipro Plaza aliases stay city-scoped and canonicalized', () => {
  const entry = HOUSING_POI_EXTENSIONS.find((item) => item.canonical === 'Dnipro Plaza');

  assert.ok(entry);
  assert.equal(entry.category, 'shopping_mall');
  assert.equal(entry.country, 'UA');
  assert.equal(entry.city, 'Cherkasy');
  assert.deepEqual(entry.aliases.uk, ['ТРЦ «Дніпро-Плаза»', 'ТРЦ Дніпро Плаза', 'Дніпро Плаза']);
  assert.deepEqual(entry.aliases.en, ['Dnipro Plaza']);
  assert.equal(entry.aliases.uk.includes('Черкаси'), false);
});
