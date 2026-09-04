import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

const cases = Object.freeze([
  ['мкр Курманбек', 'KG', 'Jalal-Abad', 'Микрорайон Курманбек'],
  ['Курманбек микрорайон', 'KG', 'Jalal-Abad', 'Микрорайон Курманбек'],
  ['ЖК Оазис', 'KZ', 'Oskemen', 'Оазис'],
  ['Рахат жилой комплекс', 'KZ', 'Oskemen', 'Рахат'],
  ['ЖК "Renesans"', 'KZ', 'Oskemen', 'Renesans'],
]);

test('deferred Central Asia location aliases resolve in city scope', () => {
  for (const [text, country, city, expected] of cases) {
    assert.equal(matchDictionaryLocation(text, country, city)?.name, expected, `${city}: ${text}`);
  }
});
