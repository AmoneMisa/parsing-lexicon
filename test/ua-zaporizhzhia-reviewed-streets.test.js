import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'вулиця Білогірська',
  'вулиця Мирна',
  'вулиця Молочна',
  'вулиця Почаївська',
  'вулиця Радіальна',
  'вулиця Радісна',
  'вулиця Садівництва',
  'вулиця Слобожанська',
  'вулиця Теслярська',
  'вулиця Фонтанна',
  'проспект Інженера Преображенського',
  'проспект Героїв Національної Гвардії України',
  'проспект Металургів',
  'проспект Соборний',
  'проспект Ювілейний',
  'Арабатський провулок',
  'Балхашський провулок',
  'Березневий провулок',
  'Вірний провулок',
  'Галицький провулок',
  'Гурзуфський провулок',
  'Гімалайський провулок',
  'Дніпрорудний провулок',
  'Олега Мельниченка провулок',
  'Прохолодний провулок',
  'Спасівський провулок',
  'Тираспольський провулок',
  'Хвилясний провулок',
  'Ширшова провулок',
  'провулок Бакинський',
  'провулок Березовий',
  'Бельфорський бульвар',
  'бульвар Будівельників',
  'бульвар Героїв полку Азов',
  'бульвар Марії Примаченко',
  'бульвар Парковий',
  'бульвар Центральний',
  'бульвар Шевченка',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UA', 'Zaporizhzhia');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Zaporizhzhia street owners are exposed once in the city dictionary', () => {
  const zaporizhzhia = dictionaryFor('UA', 'Zaporizhzhia');
  for (const name of names) {
    const matches = (zaporizhzhia.streets || []).filter((entry) => entry.name === name);
    assert.equal(matches.length, 1, name);
    assert.ok(byName(zaporizhzhia.streets, name), name);
  }
});

test('reviewed Zaporizhzhia aliases resolve with explicit street qualifiers', () => {
  assertStreetMatch('вул. Білогірська, 12', 'вулиця Білогірська');
  assertStreetMatch('вул. Слобожанська', 'вулиця Слобожанська');
  assertStreetMatch('просп. Інженера Преображенського', 'проспект Інженера Преображенського');
  assertStreetMatch('пр-т Соборний', 'проспект Соборний');
  assertStreetMatch('пров. Арабатський', 'Арабатський провулок');
  assertStreetMatch('провулок Олега Мельниченка', 'Олега Мельниченка провулок');
  assertStreetMatch('пров. Бакинський', 'провулок Бакинський');
  assertStreetMatch('Бельфорський бул.', 'Бельфорський бульвар');
  assertStreetMatch('бул. Героїв полку Азов', 'бульвар Героїв полку Азов');
  assertStreetMatch('бул. Шевченка', 'бульвар Шевченка');
});

test('rural scrape hits are not introduced as Zaporizhzhia street owners', () => {
  for (const text of ['Квітковий провулок', 'провулок Княжий']) {
    const match = matchDictionaryLocation(text, 'UA', 'Zaporizhzhia');
    assert.notEqual(match?.type, 'streets', text);
  }
});
