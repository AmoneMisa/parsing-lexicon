import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Taraz scrape-backed streets are exposed', () => {
  const streets = new Set((dictionaryFor('KZ', 'Taraz')?.streets || []).map(({ name }) => name));
  for (const name of [
    'Проспект Жамбыла',
    'Улица Барбюса',
    'Улица Жусипа Баласагуна',
    'Улица Пушкина',
  ]) {
    assert.ok(streets.has(name), `Taraz should contain ${name}`);
  }
});

test('Taraz Russian, Kazakh and Latin street forms resolve to stable canonicals', () => {
  const cases = [
    ['Жамбыл даңғылы 15', 'Проспект Жамбыла'],
    ['Barbusse Street 8', 'Улица Барбюса'],
    ['Жүсіп Баласағұн көшесі 21', 'Улица Жусипа Баласагуна'],
    ['Пушкин көшесі 4', 'Улица Пушкина'],
    ['Zhambyl Avenue 40', 'Проспект Жамбыла'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Taraz');
    assert.equal(match?.type, 'streets', text);
    assert.equal(match?.name, expected, text);
  }
});
