import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'residentialComplexes' ? result.name : null;
}

test('Kharkiv Sokolnyky, Rohatynskyi and Saltivskyi aliases resolve', () => {
  const cases = new Map([
    ['Сокільники', 'Sokolnyky'],
    ['ЖК Сокільники', 'Sokolnyky'],
    ['Сокольники', 'Sokolnyky'],
    ['ЖК Сокольники', 'Sokolnyky'],
    ['Рогатинський', 'Rohatynskyi'],
    ['ЖК Рогатинський', 'Rohatynskyi'],
    ['Рогатинский', 'Rohatynskyi'],
    ['ЖК Рогатинский', 'Rohatynskyi'],
    ['Салтівський', 'Saltivskyi'],
    ['ЖК Салтівський', 'Saltivskyi'],
    ['Салтовский', 'Saltivskyi'],
    ['ЖК Салтовский', 'Saltivskyi'],
  ]);

  for (const [alias, canonical] of cases) {
    assert.equal(match('Kharkiv', alias), canonical);
  }
});

test('new Kharkiv residential aliases do not leak into Kyiv', () => {
  for (const alias of ['ЖК Сокольники', 'ЖК Рогатинский', 'ЖК Салтовский']) {
    assert.equal(match('Kyiv', alias), null);
  }
});
