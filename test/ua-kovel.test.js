import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Kovel dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Kovel');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Kovel Railway Station'));
  assert.ok(names.has('Lesya Ukrainka Park'));
});

test('Kovel landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ['Залізничний вокзал Ковель', 'Kovel Railway Station'],
    ['Вокзал станції Ковель', 'Kovel Railway Station'],
    ['парк імені Лесі Українки', 'Lesya Ukrainka Park'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Kovel');
    assert.equal(match?.city, 'Kovel');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
