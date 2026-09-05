import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const names = Object.freeze([
  'провулок Курортний',
  'Армійський провулок',
  'Фінський провулок',
  'Міжрічковий провулок',
  'Перший провулок',
  'Очаковский переулок',
  'Измаильский переулок',
  '4-й Парниковый переулок',
  '1-й Парниковый переулок',
  '2-й Парниковый переулок',
  'Офицерский бульвар',
  'Бузький бульвар',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UA', 'Mykolaiv');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Mykolaiv street owners are exposed once in the city dictionary', () => {
  const city = dictionaryFor('UA', 'Mykolaiv');
  for (const name of names) {
    const matches = (city.streets || []).filter((entry) => entry.name === name);
    assert.equal(matches.length, 1, name);
  }
});

test('reviewed Mykolaiv aliases resolve with explicit street qualifiers', () => {
  assertStreetMatch('пров. Курортний', 'провулок Курортний');
  assertStreetMatch('провулок Армійський', 'Армійський провулок');
  assertStreetMatch('пер. Очаковский', 'Очаковский переулок');
  assertStreetMatch('переулок 1-й Парниковый', '1-й Парниковый переулок');
  assertStreetMatch('бульвар Офицерский', 'Офицерский бульвар');
  assertStreetMatch('бул. Бузький', 'Бузький бульвар');
  assertStreetMatch('Бугский бульвар', 'Бузький бульвар');
});

test('reviewed Mykolaiv aliases do not absorb the independent Flotskyi boulevard', () => {
  const city = dictionaryFor('UA', 'Mykolaiv');
  const owners = (city.streets || []).filter((entry) => entry.name === 'Flotskyi Boulevard');
  assert.equal(owners.length, 0);

  const match = matchDictionaryLocation('Флотский бульвар', 'UA', 'Mykolaiv');
  assert.notEqual(match?.name, 'Бузький бульвар');
});
