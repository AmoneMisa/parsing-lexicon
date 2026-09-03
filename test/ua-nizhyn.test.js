import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Nizhyn dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Nizhyn');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Nizhyn Railway Station'));
  assert.ok(names.has('Ніжинський краєзнавчий музей імені Івана Спаського'));
  assert.ok(names.has('Ніжинська поштова станція'));
});

test('Nizhyn landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ['Залізничний вокзал Ніжина', 'Nizhyn Railway Station'],
    ['Ніжинський краєзнавчий музей ім. І. Спаського', 'Ніжинський краєзнавчий музей імені Івана Спаського'],
    ['Музей «Ніжинська поштова станція»', 'Ніжинська поштова станція'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Nizhyn');
    assert.equal(match?.city, 'Nizhyn');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
