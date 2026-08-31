import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'landmarks' ? result.name : null;
}

test('Kharkiv Lisopark aliases resolve across Ukrainian and Russian forms', () => {
  for (const alias of ['Лісопарк', 'Харківський лісопарк', 'Лесопарк', 'Харьковский лесопарк']) {
    assert.equal(match('Kharkiv', alias), 'Lisopark');
  }
});

test('Kharkiv Lisopark aliases stay city-scoped', () => {
  assert.equal(match('Kyiv', 'Харківський лісопарк'), null);
  assert.equal(match('Kyiv', 'Харьковский лесопарк'), null);
});
