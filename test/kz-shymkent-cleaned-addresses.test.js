import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';
import { KZ_SHYMKENT_CLEANED_ADDRESS_EXTENSIONS } from '../src/kz-shymkent-cleaned-address-extensions.js';

const names = (key) => new Set((dictionaryFor('KZ', 'Shymkent')?.[key] || []).map(({ name }) => name));

test('remaining cleaned Shymkent address batch is complete', () => {
  const batch = KZ_SHYMKENT_CLEANED_ADDRESS_EXTENSIONS.Shymkent;
  assert.equal(batch.streets.length, 34);
  assert.equal(batch.microdistricts.length, 1);

  const streets = names('streets');
  for (const name of [
    'Кремлёвская улица',
    'Улица 1-го Мая',
    'Улица Амире Кашаубаева',
    'Улица Жасталап',
    'Улица Наурыз',
    'Улица Сырым батыра',
    'Улица Хан-Тенгри',
    'Улица Шугыла',
  ]) {
    assert.ok(streets.has(name), `Shymkent should contain street ${name}`);
  }

  assert.ok(names('microdistricts').has('Astana'));
});

test('Shymkent cleaned Russian and Kazakh street forms resolve correctly', () => {
  const cases = [
    ['ул. Кремлевская, 12', 'Кремлёвская улица'],
    ['улица 1-го Мая', 'Улица 1-го Мая'],
    ['Әміре Қашаубаев көшесі', 'Улица Амире Кашаубаева'],
    ['Ақшам көшесі', 'Улица Акшам'],
    ['Наурыз көшесі', 'Улица Наурыз'],
    ['Сырым батыр көшесі', 'Улица Сырым батыра'],
    ['Тұлпар көшесі', 'Улица Тулпар'],
    ['Хан Тәңірі көшесі', 'Улица Хан-Тенгри'],
    ['Шағатай көшесі', 'Улица Шагатай'],
    ['Шұғыла көшесі', 'Улица Шугыла'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Shymkent');
    assert.equal(match?.type, 'streets', text);
    assert.equal(match?.name, expected, text);
  }
});

test('cleaned Astana microdistrict is scoped to Shymkent', () => {
  for (const text of ['микрорайон Астана', 'мкр Астана', 'Астана шағын ауданы']) {
    const match = matchDictionaryLocation(text, 'KZ', 'Shymkent');
    assert.equal(match?.type, 'microdistricts', text);
    assert.equal(match?.name, 'Astana', text);
  }
});

test('first Shymkent cleaned address batch retains canonical ownership', () => {
  const cases = [
    ['Бәйдібек би даңғылы', 'Проспект Байдибек би'],
    ['Ақбота көшесі', 'Улица Акбота'],
    ['Арғынбеков көшесі', 'Улица Аргынбекова'],
    ['Құрылтай көшесі', 'Улица Курылтай'],
    ['18 микрорайон', '18 microdistrict'],
    ['Ақжайық', 'Akzhaiyk'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Shymkent');
    assert.equal(match?.name, expected, text);
  }
});
