import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

const cases = Object.freeze([
  ['1 мкр', 'KZ', 'Aktobe', '1-й микрорайон'],
  ['3-й микрорайон', 'KZ', 'Aktobe', '3-й микрорайон'],
  ['8 мкр.', 'KZ', 'Aktobe', '8 microdistrict'],
  ['16 мкр', 'KZ', 'Karaganda', '16 microdistrict'],
  ['8-й микрорайон', 'KZ', 'Shymkent', '8-й микрорайон'],
  ['15 мкр', 'KZ', 'Shymkent', '15-й микрорайон'],
  ['микрорайон Нурсат', 'KZ', 'Shymkent', 'Нурсат'],
  ['Ұлы Дала', 'KZ', 'Taraz', 'Улы Дала'],
  ['ЖК Terracotta', 'KZ', 'Almaty', 'Terracotta'],
  ['ЖК Трилистник', 'KZ', 'Karaganda', 'Трилистник'],
]);

test('remaining Kazakhstan local geography aliases resolve in city scope', () => {
  for (const [text, country, city, expected] of cases) {
    assert.equal(matchDictionaryLocation(text, country, city)?.name, expected, `${city}: ${text}`);
  }
});
