import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'улица А. Мусаева',
  'улица Уллы жол',
  'улица Шагласын',
  'улица Каруан жолы',
  'улица Нур ата',
  'улица Кенимех',
  'улица Мажнунтал',
  'улица Дашти кыпшак',
  'улица Сахра гули',
  'улица Саламатлык',
  'улица А. Досназарова',
  'улица Айбек',
  'улица Гауир кала',
  'улица Табыс',
  'улица К. Айымбетова',
  'улица Кос кол-3',
  'улица Темир жол',
  'улица Каракалпакстан',
  'улица Бирликли',
  'улица Ораз Ахун',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Nukus');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Nukus streets are exposed as street owners', () => {
  const nukus = dictionaryFor('UZ', 'Nukus');
  for (const name of names) assert.ok(byName(nukus.streets, name), name);
});

test('reviewed Nukus street aliases resolve conservatively', () => {
  assertStreetMatch('ул. А. Мусаева, дом 7', 'улица А. Мусаева');
  assertStreetMatch('улица Уллы жол', 'улица Уллы жол');
  assertStreetMatch('ул. Дашти кыпшак', 'улица Дашти кыпшак');
  assertStreetMatch('улица Темир жол', 'улица Темир жол');
  assertStreetMatch('ул. Каракалпакстан', 'улица Каракалпакстан');
  assertStreetMatch('улица Ораз Ахун', 'улица Ораз Ахун');

  const bareCity = matchDictionaryLocation('Нукус', 'UZ', 'Nukus');
  assert.notEqual(bareCity?.type, 'streets');

  for (const poi of ['Jetour Nukus', 'Yoga Nukus', 'Nukus state technical university']) {
    const match = matchDictionaryLocation(poi, 'UZ', 'Nukus');
    assert.notEqual(match?.type, 'streets', poi);
  }
});
