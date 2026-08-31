import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'residentialComplexes' ? result.name : null;
}

test('Kharkiv Levada residential aliases resolve independently from area vocabulary', () => {
  for (const alias of ['ЖК Левада', 'ЖК Levada', 'Levada ЖК']) {
    assert.equal(match('Kharkiv', alias), 'Levada');
  }
});

test('Kharkiv Newton 2 accepts common Russian and mixed-script listing forms', () => {
  for (const alias of ['Ньютон 2', 'Ньютона 2', 'ЖК Ньютон 2', 'ЖК Ньютона 2', 'ЖК Ньютона-2', 'ЖК Newton 2']) {
    assert.equal(match('Kharkiv', alias), 'Newton 2');
  }
});

test('Levada and Newton 2 residential aliases remain city-scoped', () => {
  assert.equal(match('Kyiv', 'ЖК Levada'), null);
  assert.equal(match('Kyiv', 'ЖК Ньютона-2'), null);
});
