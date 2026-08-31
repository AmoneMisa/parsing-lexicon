import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'residentialComplexes' ? result.name : null;
}

test('Kharkiv Flagman, Kvant and Crystal aliases resolve to stable canonicals', () => {
  const cases = new Map([
    ['Флагман', 'Flagman'],
    ['ЖК Флагман', 'Flagman'],
    ['Квант', 'Kvant'],
    ['ЖК Квант', 'Kvant'],
    ['Кристал', 'Crystal'],
    ['Кристалл', 'Crystal'],
    ['ЖК Кристал', 'Crystal'],
    ['ЖК Кристалл', 'Crystal'],
    ['ЖК Crystal', 'Crystal'],
  ]);

  for (const [alias, canonical] of cases) {
    assert.equal(match('Kharkiv', alias), canonical);
  }
});

test('new Kharkiv residential aliases stay city-scoped', () => {
  for (const alias of ['ЖК Флагман', 'ЖК Квант', 'ЖК Кристалл']) {
    assert.equal(match('Kyiv', alias), null);
  }
});
