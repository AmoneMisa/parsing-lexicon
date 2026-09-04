import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Cherkasy LUBAVA aliases stay city-scoped and canonicalized', () => {
  const entry = HOUSING_POI_EXTENSIONS.find((item) => item.canonical === 'LUBAVA');

  assert.ok(entry);
  assert.equal(entry.category, 'shopping_mall');
  assert.equal(entry.country, 'UA');
  assert.equal(entry.city, 'Cherkasy');
  assert.deepEqual(entry.aliases.uk, ['ТРЦ «LUBAVA»', 'ТРЦ LUBAVA', 'ТРЦ «Любава»', 'ТРЦ Любава']);
  assert.deepEqual(entry.aliases.ru, ['ТРЦ «LUBAVA»', 'ТРЦ Любава']);
  assert.deepEqual(entry.aliases.en, ['LUBAVA', 'Lubava']);
  assert.equal(entry.aliases.uk.includes('Черкаси'), false);
});
