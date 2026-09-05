import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  '1-й поворот улицы Махтумкули улица',
  'Улица 1-й улицы Муборак',
  '1-я улица Хавзи Бодом',
  '1-я улица Шейхон',
  '2-я улица Хавзи Бодом',
  'Чашмаи Аюб улица',
  'улица Хафиза Шеразия',
  'улица Марата Каримова',
  'Мирдустим улица',
  'Мухтара Ашрафи улица',
  'Отабая Эшанова улица',
  'Писташиканон улица',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Bukhara');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Bukhara streets are exposed as street owners', () => {
  const bukhara = dictionaryFor('UZ', 'Bukhara');
  for (const name of names) assert.ok(byName(bukhara.streets, name), name);
});

test('reviewed Bukhara street aliases resolve conservatively', () => {
  assertStreetMatch('1-я улица Хавзи Бодом, дом 5', '1-я улица Хавзи Бодом');
  assertStreetMatch('1-я улица Шейхон', '1-я улица Шейхон');
  assertStreetMatch('2-я улица Хавзи Бодом', '2-я улица Хавзи Бодом');
  assertStreetMatch('ул. Хафиза Шеразия', 'улица Хафиза Шеразия');
  assertStreetMatch('ул. Марата Каримова', 'улица Марата Каримова');
  assertStreetMatch('Мирдустим улица', 'Мирдустим улица');
  assertStreetMatch('Мухтара Ашрафи улица', 'Мухтара Ашрафи улица');
  assertStreetMatch('Отабая Эшанова улица', 'Отабая Эшанова улица');
  assertStreetMatch('Писташиканон улица', 'Писташиканон улица');

  const bareCity = matchDictionaryLocation('Бухара', 'UZ', 'Bukhara');
  assert.notEqual(bareCity?.type, 'streets');
});
