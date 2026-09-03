import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Drohobych dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Drohobych');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has("St. George's Church"));
  assert.ok(names.has('Drohobych Saltworks'));
  assert.ok(names.has('Drohobych Railway Station'));
});

test('Drohobych landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ['Церква Святого Юра', "St. George's Church"],
    ['Дрогобицька солеварня', 'Drohobych Saltworks'],
    ['станція Дрогобич', 'Drohobych Railway Station'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Drohobych');
    assert.equal(match?.city, 'Drohobych');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
