import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations.js';

const EXPECTED_STREETS = Object.freeze([
  ['Amir Temur shoh ko‘chasi', 'Amir Temur Avenue'],
  ['Амира Тимура проспект', 'Amir Temur Avenue'],
  ['Шота Руставели улица', 'Shota Rustaveli Street'],
  ['Нукусская улица', 'Nukus Street'],
  ['Buyuk Ipak Yuli Street', 'Buyuk Ipak Yoli Street'],
  ['Буюк Ипак Йули улица', 'Buyuk Ipak Yoli Street'],
  ['Afrasiyab Street', 'Afrosiyob Street'],
  ['Афросиаб улица', 'Afrosiyob Street'],
  ["Mirzo Ulug'bek shoh ko'chasi", 'Mirzo Ulugbek Avenue'],
  ['Bunyudkor Avenue', 'Bunyodkor Avenue'],
  ['Мукими улица', 'Muqimiy Street'],
  ['Furkat Street', 'Furqat Street'],
  ['Беруни проспект', 'Beruniy Avenue'],
  ['Тараса Шевченко улица', 'Taras Shevchenko Street'],
  ['Ислама Каримова улица', 'Islam Karimov Street'],
]);

test('verified Tashkent arterial aliases merge into the canonical street registry', () => {
  const streets = LOCATION_DICTIONARIES.UZ.Tashkent.streets;
  const canonicals = new Set(streets.map(({ name }) => name));

  for (const canonical of [
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
  ]) {
    assert.ok(canonicals.has(canonical), canonical);
  }
});

test('verified Uzbek, Russian and OSM spelling variants resolve to stable canonicals', () => {
  for (const [input, canonical] of EXPECTED_STREETS) {
    const match = matchDictionaryLocation(input, 'UZ', 'Tashkent');
    assert.equal(match?.type, 'streets', input);
    assert.equal(match?.name, canonical, input);
  }
});
