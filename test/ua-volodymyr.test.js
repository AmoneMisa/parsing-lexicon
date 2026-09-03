import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Volodymyr dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Volodymyr');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Володимирський історичний музей імені Омеляна Дверницького'));
  assert.ok(names.has('Volodymyr dytynets'));
  assert.ok(names.has('Костел святих Йоакима та Анни'));
  assert.ok(names.has('Свято-Успенський кафедральний собор'));
  assert.ok(names.has('Свято-Василівська церква-ротонда'));
});

test('Volodymyr landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ['Володимир-Волинський історичний музей', 'Володимирський історичний музей імені Омеляна Дверницького'],
    ['Володимирський дитинець', 'Volodymyr dytynets'],
    ['Костел Йоакима і Анни', 'Костел святих Йоакима та Анни'],
    ['Парафіяльний костел святих Йоакима та Анни', 'Костел святих Йоакима та Анни'],
    ['Свято-Успенський собор', 'Свято-Успенський кафедральний собор'],
    ['Успенський собор', 'Свято-Успенський кафедральний собор'],
    ['Василівська церква-ротонда', 'Свято-Василівська церква-ротонда'],
    ['Василівська ротонда', 'Свято-Василівська церква-ротонда'],
    ['церква Святого Василя', 'Свято-Василівська церква-ротонда'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Volodymyr');
    assert.equal(match?.city, 'Volodymyr');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
