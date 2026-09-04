import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Chernihiv Masany keeps neighborhood and residential meanings distinct', () => {
  const city = dictionaryFor('UA', 'Chernihiv');
  assert.ok(city);
  assert.ok(city.microdistricts.some(({ name }) => name === 'Masany'));
  assert.ok(city.residentialComplexes.some(({ name }) => name === 'Masany'));

  const neighborhood = matchDictionaryLocation('Масани', 'UA', 'Chernihiv');
  assert.equal(neighborhood?.type, 'microdistricts');
  assert.equal(neighborhood?.name, 'Masany');

  for (const text of ['ЖК Масани', 'ЖК «Масани»', 'житловий комплекс Масани', 'жилой комплекс Масани']) {
    const residential = matchDictionaryLocation(text, 'UA', 'Chernihiv');
    assert.equal(residential?.type, 'residentialComplexes', text);
    assert.equal(residential?.name, 'Masany', text);
  }
});
