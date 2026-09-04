import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Aktobe scrape-backed streets and numbered microdistricts are exposed', () => {
  const dictionary = dictionaryFor('KZ', 'Aktobe');
  const microdistricts = new Set((dictionary?.microdistricts || []).map(({ name }) => name));
  const streets = new Set((dictionary?.streets || []).map(({ name }) => name));

  for (const name of ['4 microdistrict', '5 microdistrict', '11 microdistrict', '12 microdistrict']) {
    assert.ok(microdistricts.has(name), `Aktobe should contain ${name}`);
  }

  for (const name of [
    'Проспект Алаш',
    'Улица Бокенбай Батыра',
    'Улица Жанкожа Батыра',
    'улица Ораза Татеулы',
    'Улица Узакбая Кулымбетова',
  ]) {
    assert.ok(streets.has(name), `Aktobe should contain ${name}`);
  }
});

test('Aktobe Russian, Kazakh and English street forms resolve to stable canonicals', () => {
  const cases = [
    ['Алаш даңғылы 12', 'Проспект Алаш', 'streets'],
    ['Бөкенбай батыр көшесі 50', 'Улица Бокенбай Батыра', 'streets'],
    ['Жанқожа Батыр көшесі 9', 'Улица Жанкожа Батыра', 'streets'],
    ['Ораз Тәтеұлы көшесі 15', 'улица Ораза Татеулы', 'streets'],
    ['Ұзақбай Құлымбетов көшесі 1', 'Улица Узакбая Кулымбетова', 'streets'],
    ['Kanysh Satpayev Street 11', 'Улица Сатпаева', 'streets'],
    ['11-ші шағын аудан', '11 microdistrict', 'microdistricts'],
    ['4-й микрорайон', '4 microdistrict', 'microdistricts'],
  ];

  for (const [text, expected, type] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Aktobe');
    assert.equal(match?.type, type, text);
    assert.equal(match?.name, expected, text);
  }
});
