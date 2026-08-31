import test from 'node:test';
import assert from 'node:assert/strict';
import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'residentialComplexes' ? result.name : null;
}

test('Kharkiv Ovis aliases resolve in Ukrainian, Russian and Latin forms', () => {
  for (const value of ['Овіс', 'ЖК Овіс', 'Овис', 'ЖК Овис', 'OVIS', 'ЖК OVIS']) {
    assert.equal(match('Kharkiv', value), 'Ovis');
  }
});

test('Kharkiv Ovis aliases remain city-scoped', () => {
  assert.equal(match('Kyiv', 'ЖК Овіс'), null);
  assert.equal(match('Kyiv', 'ЖК Овис'), null);
});
