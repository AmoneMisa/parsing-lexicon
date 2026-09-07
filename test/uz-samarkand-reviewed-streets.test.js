import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  '2-я Кызылкумская',
  '1-я Самарканд улица',
  '2-я Самарканд улица',
  'Халила Султана улица',
  'Улица Махорат',
  'Намазгох переулок',
  'Улица Расадхона',
  'Улица Шахмурада',
  'Улица Устозлар',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Samarkand');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Samarkand 2GIS streets are exposed as street owners', () => {
  const samarkand = dictionaryFor('UZ', 'Samarkand');
  for (const name of names) assert.ok(byName(samarkand.streets, name), name);
});

test('reviewed Samarkand street aliases resolve conservatively', () => {
  assertStreetMatch('адрес: 2-я Кызылкумская', '2-я Кызылкумская');
  assertStreetMatch('1-я Самарканд улица, дом 12', '1-я Самарканд улица');
  assertStreetMatch('2-я Самарканд улица, дом 4', '2-я Самарканд улица');
  assertStreetMatch('Халила Султана улица', 'Халила Султана улица');
  assertStreetMatch('квартира на ул. Махорат', 'Улица Махорат');
  assertStreetMatch('дом, пер. Намазгох', 'Намазгох переулок');
  assertStreetMatch('ул. Расадхона', 'Улица Расадхона');
  assertStreetMatch('ул. Шахмурада', 'Улица Шахмурада');
  assertStreetMatch('ул. Устозлар', 'Улица Устозлар');

  const bareCity = matchDictionaryLocation('Самарканд', 'UZ', 'Samarkand');
  assert.notEqual(bareCity?.type, 'streets');
  assert.notEqual(bareCity?.name, '1-я Самарканд улица');
  assert.notEqual(bareCity?.name, '2-я Самарканд улица');
});
