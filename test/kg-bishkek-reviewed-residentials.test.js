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
  ['Жилой Комплекс "Панорама"', 'Панорама'],
  ['ЖК Панорама-2', 'Панорама 2'],
  ['Жилой комплекс Сейтек', 'Сейтек'],
  ['Жилой комплекс "Сымбат Classic"', 'Сымбат Classic'],
  ['ЖК «Тянь-Шань бермети»', 'Тянь-Шань бермети'],
  ['Жилой комплекс "Южный"', 'Южный'],
  ['ЖК «Легенда»', 'Легенда'],
  ['ЖК «Meridian»', 'Meridian'],
]);

test('reviewed Bishkek residential aliases resolve in city scope', () => {
  for (const [text, expected] of cases) {
    assert.equal(matchDictionaryLocation(text, 'KG', 'Bishkek')?.name, expected, text);
  }
});
