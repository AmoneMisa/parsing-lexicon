import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Tashkent');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Tashkent 2GIS streets are exposed as street owners', () => {
  const tashkent = dictionaryFor('UZ', 'Tashkent');
  assert.ok(byName(tashkent.streets, 'Тараккиёт 4-мавзе улица'));
  assert.ok(byName(tashkent.streets, 'Улица Ташкент'));
});

test('reviewed Tashkent street aliases stay street-qualified', () => {
  assertStreetMatch('дом на Тараккиёт 4 мавзе улица', 'Тараккиёт 4-мавзе улица');
  assertStreetMatch('квартира, ул. Ташкент', 'Улица Ташкент');

  const bareCity = matchDictionaryLocation('Ташкент', 'UZ', 'Tashkent');
  assert.notEqual(bareCity?.type, 'streets');
  assert.notEqual(bareCity?.name, 'Улица Ташкент');
});
