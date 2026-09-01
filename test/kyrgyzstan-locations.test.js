import test from 'node:test';
import assert from 'node:assert/strict';

import { canonicalCity } from '../src/geography.js';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

test('KG canonical city lexicon covers crawler cities', () => {
  assert.equal(canonicalCity('Бишкек', 'KG'), 'Bishkek');
  assert.equal(canonicalCity('Ош', 'KG'), 'Osh');
  assert.equal(canonicalCity('Каракол', 'KG'), 'Karakol');

  assert.ok(LOCATION_DICTIONARIES.KG?.Bishkek);
  assert.ok(LOCATION_DICTIONARIES.KG?.Osh);
  assert.ok(LOCATION_DICTIONARIES.KG?.Karakol);
});

test('Bishkek district and microdistrict aliases resolve', () => {
  assert.deepEqual(
    matchDictionaryLocation('квартира, Биринчи Май району, Бишкек', 'KG', 'Bishkek'),
    {
      city: 'Bishkek',
      type: 'districts',
      name: 'Pervomaisky',
      aliases: LOCATION_DICTIONARIES.KG.Bishkek.districts.find(({ name }) => name === 'Pervomaisky').aliases,
    },
  );

  assert.equal(
    matchDictionaryLocation('сдается квартира в мкр Асанбай', 'KG', 'Bishkek')?.name,
    'Asanbay',
  );
  assert.equal(
    matchDictionaryLocation('дом рядом с Дордой базары', 'KG', 'Bishkek')?.name,
    'Dordoi Bazaar',
  );
});

test('Osh and Karakol landmarks resolve with Russian/Kyrgyz aliases', () => {
  assert.equal(matchDictionaryLocation('рядом Сулайман-Тоо', 'KG', 'Osh')?.name, 'Sulayman-Too');
  assert.equal(matchDictionaryLocation('возле Дунганской мечети', 'KG', 'Karakol')?.name, 'Dungan Mosque');
});
