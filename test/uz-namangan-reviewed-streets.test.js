import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'улица Гузал',
  'Гирванбулакская улица',
  'улица Янги Арик',
  'улица Х.Хайитов',
  'улица Казанбулак',
  'улица Ипакчи',
  'улица Дилшод',
  'улица Чаманзор',
  'улица Янгиарык 2-й проезд',
  'улица Шарк гузали',
  '1-я улица Достон',
  'улица Олмазора',
  '1-я улица Чархпалак',
  'улица Бунёдкор',
  'улица Мингтерак',
  '2-я улица Табаррук',
  'улица 20-летия Независимости',
  'улица Янги Бог',
  '3-я улица Хасанабад',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Namangan');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Namangan streets are exposed as street owners', () => {
  const namangan = dictionaryFor('UZ', 'Namangan');
  for (const name of names) assert.ok(byName(namangan.streets, name), name);
});

test('reviewed Namangan street aliases resolve conservatively', () => {
  assertStreetMatch('ул. Гузал, дом 4', 'улица Гузал');
  assertStreetMatch('Гирванбулакская ул.', 'Гирванбулакская улица');
  assertStreetMatch('ул. Янги Арик', 'улица Янги Арик');
  assertStreetMatch('1-я ул. Достон', '1-я улица Достон');
  assertStreetMatch('ул. Бунёдкор', 'улица Бунёдкор');
  assertStreetMatch('ул. Мингтерак', 'улица Мингтерак');
  assertStreetMatch('3-я ул. Хасанабад', '3-я улица Хасанабад');

  const bareCity = matchDictionaryLocation('Наманган', 'UZ', 'Namangan');
  assert.notEqual(bareCity?.type, 'streets');

  for (const noise of [
    'Namangan davlat texnika universiteti',
    'Yangi Namangan tumani 86-maktab',
    'Yangi Namangan tumani hokimligi',
    'улица Саховат',
  ]) {
    const match = matchDictionaryLocation(noise, 'UZ', 'Namangan');
    assert.notEqual(match?.type, 'streets', noise);
  }
});
