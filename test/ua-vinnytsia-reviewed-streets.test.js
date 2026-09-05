import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const names = Object.freeze([
  'Свободы бульвар',
  'Марко Вовчок бульвар',
  'провулок Івана Світличного',
  'вулиця Уласа Самчука',
  'Ольги Кобылянской улица',
  'Марии Гавриш улица',
  'Августовская улица',
  'Днепровская улица',
  'Юности проспект',
  'проспект Космонавтів',
  'Коцюбинского проспект',
  '2-й провулок Тетяни Яблонської',
  '1-й провулок Тетяни Яблонської',
  '1-й Восточный переулок',
  'Привокзальный переулок',
  '1-й Ботанический переулок',
  '3-й Руданского переулок',
  'Игоря Савченко переулок',
  '2-й Ботанический переулок',
  '2-й Одесский переулок',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UA', 'Vinnytsia');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Vinnytsia street owners are exposed once in the city dictionary', () => {
  const city = dictionaryFor('UA', 'Vinnytsia');
  for (const name of names) {
    const matches = (city.streets || []).filter((entry) => entry.name === name);
    assert.equal(matches.length, 1, name);
  }
});

test('reviewed Vinnytsia aliases stay explicitly street-qualified', () => {
  assertStreetMatch('бульвар Свободы', 'Свободы бульвар');
  assertStreetMatch('Марко Вовчок бул.', 'Марко Вовчок бульвар');
  assertStreetMatch('пров. Івана Світличного', 'провулок Івана Світличного');
  assertStreetMatch('вул. Уласа Самчука', 'вулиця Уласа Самчука');
  assertStreetMatch('улица Марии Гавриш', 'Марии Гавриш улица');
  assertStreetMatch('пр-т Юности', 'Юности проспект');
  assertStreetMatch('просп. Космонавтів', 'проспект Космонавтів');
  assertStreetMatch('пров. 1-й Тетяни Яблонської', '1-й провулок Тетяни Яблонської');
  assertStreetMatch('пер. Привокзальный', 'Привокзальный переулок');
  assertStreetMatch('переулок Игоря Савченко', 'Игоря Савченко переулок');
});
