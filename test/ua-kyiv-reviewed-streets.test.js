import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

test('reviewed Kyiv boulevard is exposed as a street owner', () => {
  const kyiv = dictionaryFor('UA', 'Kyiv');
  const entry = (kyiv.streets || []).find(({ name }) => name === 'бульвар Тараса Шевченко');
  assert.ok(entry);
});

test('reviewed Kyiv boulevard matches only with a boulevard marker', () => {
  for (const text of ['бульвар Тараса Шевченко, 12', 'бул. Тараса Шевченко']) {
    const match = matchDictionaryLocation(text, 'UA', 'Kyiv');
    assert.ok(match, text);
    assert.equal(match.type, 'streets', text);
    assert.equal(match.name, 'бульвар Тараса Шевченко', text);
  }

  const bare = matchDictionaryLocation('Тараса Шевченко', 'UA', 'Kyiv');
  assert.notEqual(bare?.type, 'streets');

  for (const noise of ['Контрактова площа', 'Михайлівська площа', 'Міжнародний аеропорт Київ']) {
    const match = matchDictionaryLocation(noise, 'UA', 'Kyiv');
    assert.notEqual(match?.type, 'streets', noise);
  }
});
