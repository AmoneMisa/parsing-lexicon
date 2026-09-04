import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

const cases = Object.freeze([
  ['ЖК «Аккула»', 'Аккула'],
  ['ЖК Алтын Булак', 'Алтын Булак'],
  ['ЖК «Ботанический сад»', 'Ботанический сад'],
  ['Жилой комплекс "Флагман"', 'Флагман'],
  ['ЖК "Хан-Теңири"', 'Хан-Теңири'],
  ['ЖК «Кудайберген»', 'Кудайберген'],
]);

test('reviewed Bishkek residential aliases resolve in city scope', () => {
  for (const [text, expected] of cases) {
    assert.equal(matchDictionaryLocation(text, 'KG', 'Bishkek')?.name, expected, text);
  }
});
