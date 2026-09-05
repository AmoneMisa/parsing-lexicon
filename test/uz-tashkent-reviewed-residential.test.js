import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'ЖК "Актепа Сохил буйи"',
  'ЖК "Бтги Шамол"',
  'Жилой комплекс Elegant',
  'ЖК "Грин Сити" (Дровосеки)',
  'жилой комплекс Гульсарай',
  'Хувайдо жилой комплекс',
  'Жилой комплекс LOTUS 7',
  'жилой комплекс "Milliy House" от NESS',
  'ЖК "Ness City"',
  'жилой комплекс "Ness One" от Ness',
  'ЖК "Ness Sebzar"',
  "Жилой комплекс 'Оазис'",
  'Переспектива жилой комплекс',
  'Sultania ЖК',
  'ЖК Учтепа Авению',
  'ЖК Янгибахт',
  'Жилой комплекс “Замок счастья”',
]);

const assertMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Tashkent');
  assert.ok(match, text);
  assert.equal(match.type, 'residentialComplexes', text);
  assert.equal(match.name, name, text);
};

test('reviewed Tashkent residential batch is exposed as residential-complex owners', () => {
  const tashkent = dictionaryFor('UZ', 'Tashkent');
  for (const name of names) assert.ok(byName(tashkent.residentialComplexes, name), name);
});

test('reviewed Tashkent residential aliases resolve to the same canonical owners', () => {
  assertMatch('квартира в Актепа Сохил буйи', 'ЖК "Актепа Сохил буйи"');
  assertMatch('квартира в ЖК Бтги Шамол', 'ЖК "Бтги Шамол"');
  assertMatch('квартира в ЖК Elegant', 'Жилой комплекс Elegant');
  assertMatch('продаётся в Грин Сити (Дровосеки)', 'ЖК "Грин Сити" (Дровосеки)');
  assertMatch('квартира Гульсарай', 'жилой комплекс Гульсарай');
  assertMatch('LOTUS 7 квартира', 'Жилой комплекс LOTUS 7');
  assertMatch('Milliy House от NESS', 'жилой комплекс "Milliy House" от NESS');
  assertMatch('Ness City, Ташкент', 'ЖК "Ness City"');
  assertMatch('Ness One от Ness', 'жилой комплекс "Ness One" от Ness');
  assertMatch('Ness Sebzar квартира', 'ЖК "Ness Sebzar"');
  assertMatch('квартира ЖК Оазис', "Жилой комплекс 'Оазис'");
  assertMatch('ЖК Переспектива', 'Переспектива жилой комплекс');
  assertMatch('ЖК Sultania', 'Sultania ЖК');
  assertMatch('Учтепа Авению', 'ЖК Учтепа Авению');
  assertMatch('Янгибахт квартира', 'ЖК Янгибахт');
  assertMatch('ЖК Замок счастья', 'Жилой комплекс “Замок счастья”');
});
