import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'улица Шерозий',
  'улица Бунёдкор',
  'улица Узумзор',
  'улица Мукумий',
  'Кум Кишлак улица',
  'улица Халклар Дустлиги',
  'Коратепа улица',
  'улица Корлугбогот',
  'улица Нуристон',
  'улица Хусниобод',
  'улица Туркистон',
  'Буюк Туран улица',
  'улица Жуковского',
  'улица Маргилон',
  'улица Кургантепа',
  'улица Хужабог',
  'улица Зарафшон',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Qarshi');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Qarshi streets are exposed as street owners', () => {
  const qarshi = dictionaryFor('UZ', 'Qarshi');
  for (const name of names) assert.ok(byName(qarshi.streets, name), name);
});

test('reviewed Qarshi street aliases resolve conservatively', () => {
  assertStreetMatch('ул. Шерозий, дом 3', 'улица Шерозий');
  assertStreetMatch('ул. Бунёдкор', 'улица Бунёдкор');
  assertStreetMatch('Кум Кишлак ул.', 'Кум Кишлак улица');
  assertStreetMatch('Коратепа ул.', 'Коратепа улица');
  assertStreetMatch('Буюк Туран ул.', 'Буюк Туран улица');
  assertStreetMatch('ул. Зарафшон', 'улица Зарафшон');

  const bareCity = matchDictionaryLocation('Карши', 'UZ', 'Qarshi');
  assert.notEqual(bareCity?.type, 'streets');

  for (const noise of ['Центральный стадион', 'Карши международный аэропорт']) {
    const match = matchDictionaryLocation(noise, 'UZ', 'Qarshi');
    assert.notEqual(match?.type, 'streets', noise);
  }
});
