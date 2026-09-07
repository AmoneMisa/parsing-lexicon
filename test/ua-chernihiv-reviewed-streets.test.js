import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const names = Object.freeze([
  'провулок Коти',
  'провулок Квітки Цісик',
  'провулок Поліський',
  'вулиця Євгена Онацького',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UA', 'Chernihiv');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Chernihiv street owners are exposed once in the city dictionary', () => {
  const city = dictionaryFor('UA', 'Chernihiv');
  for (const name of names) {
    const matches = (city.streets || []).filter((entry) => entry.name === name);
    assert.equal(matches.length, 1, name);
  }
});

test('reviewed Chernihiv aliases resolve with explicit street qualifiers', () => {
  assertStreetMatch('пров. Коти', 'провулок Коти');
  assertStreetMatch('пров. Квітки Цісик', 'провулок Квітки Цісик');
  assertStreetMatch('пров. Поліський', 'провулок Поліський');
  assertStreetMatch('вул. Євгена Онацького', 'вулиця Євгена Онацького');
});

test('nearby rural lanes are not introduced as Chernihiv streets', () => {
  for (const text of [
    'провулок Центральний',
    'провулок Перемоги',
    'Горіховий провулок',
    'Вокзальный переулок',
    'Яцевский переулок',
    'Набережный переулок',
  ]) {
    const match = matchDictionaryLocation(text, 'UA', 'Chernihiv');
    assert.notEqual(match?.type, 'streets', text);
  }
});
