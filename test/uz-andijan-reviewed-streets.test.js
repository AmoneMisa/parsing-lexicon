import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'улица Абдулазиза Юлдашева',
  'Тинчлик улица',
  'улица Атабекова',
  'улица Т. Келдиева',
  'улица Шабнам',
  'улица Токлик',
  'улица Абдурауфа Фитрата',
  'улица Обихаёт',
  'улица Дамарик',
  'улица Хурсандлик',
  'улица Ифтихор',
  'улица Бахоуддина Накшбанди',
  'Сарбонтепа улица',
  'улица Саиды Зуннуновой',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Andijan');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Andijan streets are exposed as street owners', () => {
  const andijan = dictionaryFor('UZ', 'Andijan');
  for (const name of names) assert.ok(byName(andijan.streets, name), name);
});

test('reviewed Andijan street aliases resolve conservatively', () => {
  assertStreetMatch('ул. Абдулазиза Юлдашева, дом 4', 'улица Абдулазиза Юлдашева');
  assertStreetMatch('Тинчлик ул.', 'Тинчлик улица');
  assertStreetMatch('ул. Абдурауфа Фитрата', 'улица Абдурауфа Фитрата');
  assertStreetMatch('ул. Дамарик', 'улица Дамарик');
  assertStreetMatch('Сарбонтепа ул.', 'Сарбонтепа улица');
  assertStreetMatch('ул. Саиды Зуннуновой', 'улица Саиды Зуннуновой');

  const bareCity = matchDictionaryLocation('Андижан', 'UZ', 'Andijan');
  assert.notEqual(bareCity?.type, 'streets');

  for (const noise of [
    'улица С. Зуннунова',
    'Дустлик улица',
    'улица Далварзин',
    'Гумбаз улица',
    'улица Фарход',
  ]) {
    const match = matchDictionaryLocation(noise, 'UZ', 'Andijan');
    assert.notEqual(match?.type, 'streets', noise);
  }
});
