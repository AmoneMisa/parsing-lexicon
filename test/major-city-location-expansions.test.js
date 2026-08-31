import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations.js';

const match = (text, country, city) => matchDictionaryLocation(text, country, city);

test('Kharkiv recognizes Zhukovskoho listing aliases', () => {
  const result = match('Сдам квартиру, посёлок Жуковского, рядом ХАИ', 'UA', 'Kharkiv');
  assert.equal(result?.type, 'microdistricts');
  assert.equal(result?.name, 'Zhukovskoho');
});

test('Odesa recognizes newly promoted geo-backed microdistrict aliases', () => {
  assert.equal(match('квартира в Вузовском районе', 'UA', 'Odesa')?.name, 'Vuzivskyi');
  assert.equal(match('дом на Чубаевке', 'UA', 'Odesa')?.name, 'Chubaivka');
  assert.equal(match('ж/м Котовского, аренда', 'UA', 'Odesa')?.name, 'Kotivskoho');
});

test('Kyiv accepts common transliteration variants without changing canonicals', () => {
  assert.equal(match('flat in Troieshchyna', 'UA', 'Kyiv')?.name, 'Troyeshchyna');
  assert.equal(match('apartment in Lypky', 'UA', 'Kyiv')?.name, 'Lipky');
  assert.equal(match('Borshchagovka apartment', 'UA', 'Kyiv')?.name, 'Borshchahivka');
});

test('Samarkand normalizes Sogdiana and Kimyogarlar to their physical semantic types', () => {
  const sogdiana = match('квартира в Согдиёне', 'UZ', 'Samarkand');
  assert.equal(sogdiana?.type, 'mahallas');
  assert.equal(sogdiana?.name, 'Sogdiana');

  const kimyogarlar = match('дом, Химгородок, Самарканд', 'UZ', 'Samarkand');
  assert.equal(kimyogarlar?.type, 'settlements');
  assert.equal(kimyogarlar?.name, 'Kimyogarlar');

  assert.equal(
    (LOCATION_DICTIONARIES.UZ.Samarkand.microdistricts || []).some(({ name }) => name === 'Sogdiana' || name === 'Kimyogarlar'),
    false,
  );
  assert.equal(
    (LOCATION_DICTIONARIES.UZ.Samarkand.localAreas || []).some(({ name }) => name === 'Sugdiyona' || name === 'Kimyogarlar'),
    false,
  );
});
