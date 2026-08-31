import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'residentialComplexes' ? result.name : null;
}

test('Kharkiv Sokolnyky, Rohatynskyi and Saltivskyi residential aliases resolve with safe context', () => {
  const cases = new Map([
    ['ЖК Сокільники', 'Sokolnyky'],
    ['ЖК Сокольники', 'Sokolnyky'],
    ['Рогатинський', 'Rohatynskyi'],
    ['ЖК Рогатинський', 'Rohatynskyi'],
    ['Рогатинский', 'Rohatynskyi'],
    ['ЖК Рогатинский', 'Rohatynskyi'],
    ['ЖК Салтівський', 'Saltivskyi'],
    ['ЖК Салтовский', 'Saltivskyi'],
  ]);

  for (const [alias, canonical] of cases) {
    assert.equal(match('Kharkiv', alias), canonical);
  }
});

test('bare Sokolnyky and Saltivskyi forms stay available to non-residential geography', () => {
  assert.equal(match('Kharkiv', 'Сокільники'), null);
  assert.equal(match('Kharkiv', 'Сокольники'), null);
  assert.equal(match('Kharkiv', 'Салтівський'), null);
  assert.equal(match('Kharkiv', 'Салтовский'), null);
});

test('new Kharkiv residential aliases do not leak into Kyiv', () => {
  for (const alias of ['ЖК Сокольники', 'ЖК Рогатинский', 'ЖК Салтовский']) {
    assert.equal(match('Kyiv', alias), null);
  }
});
