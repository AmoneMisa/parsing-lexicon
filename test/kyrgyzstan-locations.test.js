import test from 'node:test';
import assert from 'node:assert/strict';

import { canonicalCentralAsiaCity, canonicalKyrgyzstanCity, KG_CITY_CATALOG, KG_LOCATION_TERMS } from '../src/central-asia.js';
import { canonicalCity } from '../src/geography.js';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

const crawlerCities = Object.freeze([
  'Bishkek',
  'Osh',
  'Manas',
  'Karakol',
  'Tokmok',
  'Naryn',
  'Talas',
  'Batken',
  'Kara-Balta',
  'Balykchy',
  'Kant',
  'Uzgen',
  'Kyzyl-Kiya',
]);

test('KG canonical city lexicon covers country-wide crawler cities', () => {
  assert.equal(canonicalCity('Бишкек', 'KG'), 'Bishkek');
  assert.equal(canonicalCity('Ош', 'KG'), 'Osh');
  assert.equal(canonicalCity('Манас', 'KG'), 'Manas');
  assert.equal(canonicalCity('Жалал-Абад', 'KG'), 'Manas');
  assert.equal(canonicalCity('Өзгөн', 'KG'), 'Uzgen');
  assert.equal(canonicalKyrgyzstanCity('Кара-Балта'), 'Kara-Balta');
  assert.equal(canonicalCentralAsiaCity('Кызыл-Кыя', 'KG'), 'Kyzyl-Kiya');
  assert.ok(KG_LOCATION_TERMS.microdistrict.includes('кичирайон'));

  for (const city of crawlerCities) {
    assert.ok(KG_CITY_CATALOG.some(({ canonical }) => canonical === city), city);
    assert.ok(LOCATION_DICTIONARIES.KG?.[city], city);
  }
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
