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

const officialCitiesAddedToTheCatalog = Object.freeze([
  'Aydarken', 'Bazar-Korgon', 'Cholpon-Ata', 'Gulcho', 'Kadamjay',
  'Kara-Kol', 'Kara-Suu', 'Kayyngdy', 'Kemin', 'Kerben', 'Kochkor-Ata',
  'Kok-Janggak', 'Mayluu-Suu', 'Nookat', 'Orlovka', 'Razzakov', 'Shopokov',
  'Suluktu', 'Tash-Kumur', 'Toktogul',
]);

test('KG canonical city lexicon covers country-wide crawler cities', () => {
  assert.equal(canonicalCity('Бишкек', 'KG'), 'Bishkek');
  assert.equal(canonicalCity('Ош', 'KG'), 'Osh');
  assert.equal(canonicalCity('Манас', 'KG'), 'Manas');
  assert.equal(canonicalCity('Жалал-Абад', 'KG'), 'Manas');
  assert.equal(canonicalCity('Өзгөн', 'KG'), 'Uzgen');
  assert.equal(canonicalKyrgyzstanCity('Кара-Балта'), 'Kara-Balta');
  assert.equal(canonicalCentralAsiaCity('Кызыл-Кыя', 'KG'), 'Kyzyl-Kiya');
  assert.equal(canonicalCity('Базар-Коргон', 'KG'), 'Bazar-Korgon');
  assert.equal(canonicalCity('Кара-Куль', 'KG'), 'Kara-Kol');
  assert.equal(canonicalCity('Исфана', 'KG'), 'Razzakov');
  assert.equal(KG_CITY_CATALOG.length, 33);
  assert.ok(KG_LOCATION_TERMS.microdistrict.includes('кичирайон'));

  for (const city of crawlerCities) {
    assert.ok(KG_CITY_CATALOG.some(({ canonical }) => canonical === city), city);
    assert.ok(LOCATION_DICTIONARIES.KG?.[city], city);
  }
  for (const city of officialCitiesAddedToTheCatalog) {
    assert.ok(KG_CITY_CATALOG.some(({ canonical }) => canonical === city), city);
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
