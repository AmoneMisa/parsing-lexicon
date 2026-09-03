import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Volodymyr dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Volodymyr');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Володимирський історичний музей імені Омеляна Дверницького'));
  assert.ok(names.has('Volodymyr dytynets'));
});

test('Volodymyr landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ['Володимир-Волинський історичний музей', 'Володимирський історичний музей імені Омеляна Дверницького'],
    ['Володимирський дитинець', 'Volodymyr dytynets'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Volodymyr');
    assert.equal(match?.city, 'Volodymyr');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
