import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations.js';

const match = (text, country, city) => matchDictionaryLocation(text, country, city);

test('Kharkiv recognizes Zhukovskoho and Kulynychi listing aliases', () => {
  const zhukovskoho = match('Сдам квартиру, посёлок Жуковского, рядом ХАИ', 'UA', 'Kharkiv');
  assert.equal(zhukovskoho?.type, 'microdistricts');
  assert.equal(zhukovskoho?.name, 'Zhukovskoho');

  const kulynychi = match('дом, селище Кулиничі, Харків', 'UA', 'Kharkiv');
  assert.equal(kulynychi?.type, 'microdistricts');
  assert.equal(kulynychi?.name, 'Kulynychi');
});

test('Odesa recognizes expanded colloquial microdistrict aliases', () => {
  assert.equal(match('Вузовский район, квартира', 'UA', 'Odesa')?.name, 'Vuzivskyi');
  assert.equal(match('Чубаевка, дом', 'UA', 'Odesa')?.name, 'Chubaivka');
  assert.equal(match('ж/м Котовского, аренда', 'UA', 'Odesa')?.name, 'Kotivskoho');
  assert.equal(match('квартира на Молдаванке', 'UA', 'Odesa')?.name, 'Moldavanka');
  assert.equal(match('дом, район Пересыпи', 'UA', 'Odesa')?.name, 'Peresyp');
  assert.equal(match('Черноморка район, участок', 'UA', 'Odesa')?.name, 'Chornomorka');
});

test('Kyiv accepts common transliteration variants without changing canonicals', () => {
  assert.equal(match('flat in Troieshchyna', 'UA', 'Kyiv')?.name, 'Troyeshchyna');
  assert.equal(match('apartment in Lypky', 'UA', 'Kyiv')?.name, 'Lipky');
  assert.equal(match('Borshchagovka apartment', 'UA', 'Kyiv')?.name, 'Borshchahivka');
  assert.equal(match('flat in Shulyavka', 'UA', 'Kyiv')?.name, 'Shuliavka');
  assert.equal(match('apartment in Solomyanka', 'UA', 'Kyiv')?.name, 'Solomianka');
  assert.equal(match('rent in Kurenevka', 'UA', 'Kyiv')?.name, 'Kurenivka');
  assert.equal(match('flat in Rusanovka', 'UA', 'Kyiv')?.name, 'Rusanivka');
  assert.equal(match('apartment Poznyaki', 'UA', 'Kyiv')?.name, 'Pozniaky');
});

test('Samarkand normalizes Sogdiana and Kimyogarlar to their physical semantic types', () => {
  const sogdiana = match('махалля Согдиёна', 'UZ', 'Samarkand');
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
