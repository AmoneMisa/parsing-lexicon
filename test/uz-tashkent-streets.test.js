import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

const EXPECTED_STREETS = Object.freeze([
  ["Gulobod ko'chasi", 'Gulobod Street'],
  ['улица Гулобод', 'Gulobod Street'],
  ["Sebzor ko'chasi", 'Sebzor Street'],
  ['улица Себзор', 'Sebzor Street'],
  ["Lolazor ko'chasi", 'Lolazor Street'],
  ['улица Лолазор', 'Lolazor Street'],
  ["Shohimardon ko'chasi", 'Shohimardon Street'],
  ['улица Шохимардон', 'Shohimardon Street'],
  ["Shohimardon 1-tor ko'chasi", 'Shohimardon Passage 1'],
  ['1-й проезд Шохимардон', 'Shohimardon Passage 1'],
  ["Oltinko'l ko'chasi", "Oltinko'l Street"],
  ['улица Олтинкуль', "Oltinko'l Street"],
  ["Oltinko'l 1-tor ko'chasi", "Oltinko'l Passage 1"],
  ['1-й проезд Олтинкуль', "Oltinko'l Passage 1"],
  ["Rakatboshi ko'chasi", 'Rakatboshi Street'],
  ['улица Ракатбоши', 'Rakatboshi Street'],
  ['Amir Temur shoh ko‘chasi', 'Amir Temur Avenue'],
  ['проспект Амира Темура', 'Amir Temur Avenue'],
  ['Shota Rustaveli ko‘chasi', 'Shota Rustaveli Street'],
  ['улица Шота Руставели', 'Shota Rustaveli Street'],
  ['Nukus ko‘chasi', 'Nukus Street'],
  ['Нукус кўчаси', 'Nukus Street'],
  ["Buyuk Ipak Yo'li ko'chasi", 'Buyuk Ipak Yoli Street'],
  ['Буюк Ипак Йўли кўчаси', 'Buyuk Ipak Yoli Street'],
  ['Afrosiyob ko‘chasi', 'Afrosiyob Street'],
  ['Афросиёб кўчаси', 'Afrosiyob Street'],
  ["Mirzo Ulug'bek shoh ko'chasi", 'Mirzo Ulugbek Avenue'],
  ['Мирзо Улуғбек шоҳ кўчаси', 'Mirzo Ulugbek Avenue'],
  ['Bunyodkor shoh ko‘chasi', 'Bunyodkor Avenue'],
  ['Бунёдкор шоҳ кўчаси', 'Bunyodkor Avenue'],
  ['Muqimiy ko‘chasi', 'Muqimiy Street'],
  ['Муқимий кўчаси', 'Muqimiy Street'],
  ['Furqat ko‘chasi', 'Furqat Street'],
  ['Фурқат кўчаси', 'Furqat Street'],
  ['Beruniy shoh ko‘chasi', 'Beruniy Avenue'],
  ['Беруний шоҳ кўчаси', 'Beruniy Avenue'],
  ['Taras Shevchenko ko‘chasi', 'Taras Shevchenko Street'],
  ['улица Тараса Шевченко', 'Taras Shevchenko Street'],
  ['Islom Karimov ko‘chasi', 'Islam Karimov Street'],
  ['Ислом Каримов кўчаси', 'Islam Karimov Street'],
  ["Shifokorlar ko'chasi", 'Shifokorlar Street'],
  ['улица Шифокорлар', 'Shifokorlar Street'],
  ["Shimoliy Olmazor ko'chasi", 'Shimoliy Olmazor Street'],
  ['улица Шимолий Олмазор', 'Shimoliy Olmazor Street'],
]);

const EXPECTED_CANONICALS = Object.freeze([
  'Gulobod Street',
  'Sebzor Street',
  'Lolazor Street',
  'Shohimardon Street',
  'Shohimardon Passage 1',
  "Oltinko'l Street",
  "Oltinko'l Passage 1",
  'Rakatboshi Street',
  'Amir Temur Avenue',
  'Shota Rustaveli Street',
  'Nukus Street',
  'Buyuk Ipak Yoli Street',
  'Afrosiyob Street',
  'Mirzo Ulugbek Avenue',
  'Bunyodkor Avenue',
  'Muqimiy Street',
  'Furqat Street',
  'Beruniy Avenue',
  'Taras Shevchenko Street',
  'Islam Karimov Street',
  'Shifokorlar Street',
  'Shimoliy Olmazor Street',
]);

test('Tashkent streets stay in the canonical UZ registry', () => {
  const streets = LOCATION_DICTIONARIES.UZ.Tashkent.streets;
  const canonicals = new Set(streets.map(({ name }) => name));

  for (const canonical of EXPECTED_CANONICALS) {
    assert.ok(canonicals.has(canonical), canonical);
  }
});

test('existing Russian and Uzbek street translations resolve to stable canonicals', () => {
  for (const [input, canonical] of EXPECTED_STREETS) {
    const match = matchDictionaryLocation(input, 'UZ', 'Tashkent');
    assert.equal(match?.type, 'streets', input);
    assert.equal(match?.name, canonical, input);
  }
});

test('address-shaped Shifokorlar and Shimoliy Olmazor text resolves as streets', () => {
  const cases = [
    ['улица Шифокорлар, 6', 'Shifokorlar Street'],
    ['Улица Шимолий Олмазор, 1', 'Shimoliy Olmazor Street'],
  ];

  for (const [input, canonical] of cases) {
    const match = matchDictionaryLocation(input, 'UZ', 'Tashkent');
    assert.equal(match?.type, 'streets', input);
    assert.equal(match?.name, canonical, input);
  }
});
