import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

const names = (city, key) => new Set((dictionaryFor('KZ', city)?.[key] || []).map(({ name }) => name));

test('Shymkent scrape-backed neighborhoods and streets are exposed', () => {
  const microdistricts = names('Shymkent', 'microdistricts');
  for (const name of ['18 microdistrict', 'Akzhaiyk', 'Sairam', 'North', 'Sportivnyi', 'Shymcity']) {
    assert.ok(microdistricts.has(name), `Shymkent should contain ${name}`);
  }

  const streets = names('Shymkent', 'streets');
  for (const name of [
    'Дулати көшесі',
    'Проспект Байдибек би',
    'Улица Алии Молдагуловой',
    'Улица Ахмета Байтурсынова',
    'Улица Калдаякова',
  ]) {
    assert.ok(streets.has(name), `Shymkent should contain ${name}`);
  }
});

test('Karaganda scrape-backed neighborhoods and streets are exposed', () => {
  const microdistricts = names('Karaganda', 'microdistricts');
  for (const name of ['12 microdistrict', '14 microdistrict', '28 microdistrict', '30 microdistrict', 'Gulder-2', 'Kungei', 'Stepnoy-1']) {
    assert.ok(microdistricts.has(name), `Karaganda should contain ${name}`);
  }

  const streets = names('Karaganda', 'streets');
  for (const name of [
    'Проспект Нуркена Абдирова',
    'Улица Муканова',
    'Улица Рыскулова',
    'Улица Таттимбета',
    'Улица Чкалова',
  ]) {
    assert.ok(streets.has(name), `Karaganda should contain ${name}`);
  }
});

test('Shymkent Russian, Kazakh and Latin address aliases resolve to stable canonicals', () => {
  const cases = [
    ['Бәйдібек би даңғылы 18', 'Проспект Байдибек би', 'streets'],
    ['Әлия Молдағұлова көшесі 7', 'Улица Алии Молдагуловой', 'streets'],
    ['Ахмет Байтұрсынұлы көшесі 22', 'Улица Ахмета Байтурсынова', 'streets'],
    ['Қалдаяқов көшесі 5', 'Улица Калдаякова', 'streets'],
    ['M. H. Dulati Street 10', 'Дулати көшесі', 'streets'],
    ['Солтүстік шағын ауданы', 'North', 'microdistricts'],
    ['Ақжайық', 'Akzhaiyk', 'microdistricts'],
  ];

  for (const [text, expected, type] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Shymkent');
    assert.equal(match?.type, type, text);
    assert.equal(match?.name, expected, text);
  }
});

test('Karaganda Russian, Kazakh and Latin address aliases resolve to stable canonicals', () => {
  const cases = [
    ['Нұркен Әбдіров даңғылы 25', 'Проспект Нуркена Абдирова', 'streets'],
    ['Мұқанов көшесі 3', 'Улица Муканова', 'streets'],
    ['Рысқұлов көшесі 12', 'Улица Рыскулова', 'streets'],
    ['Тәттімбет көшесі 9', 'Улица Таттимбета', 'streets'],
    ['Chkalov Street 4', 'Улица Чкалова', 'streets'],
    ['Күнгей микрорайон', 'Kungei', 'microdistricts'],
    ['28-ші шағын аудан', '28 microdistrict', 'microdistricts'],
  ];

  for (const [text, expected, type] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Karaganda');
    assert.equal(match?.type, type, text);
    assert.equal(match?.name, expected, text);
  }
});
