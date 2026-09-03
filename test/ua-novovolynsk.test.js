import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Novovolynsk dictionary contains geo-aligned landmark canonical', () => {
  const dictionary = dictionaryFor('UA', 'Novovolynsk');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Нововолинський історичний музей'));
});

test('Novovolynsk landmark aliases resolve to historical museum', () => {
  const cases = [
    ['Нововолинський міський історичний музей', 'Нововолинський історичний музей'],
    ['Novovolynsk Historical Museum', 'Нововолинський історичний музей'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Novovolynsk');
    assert.equal(match?.city, 'Novovolynsk');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
