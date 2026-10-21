import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHousingFeatures } from '../src/housing-features.js';
import { parseHousingPrice } from '../src/housing-money.js';

const ODESA_LISTING = `Сдам 1 комнатную квартиру улица львовская 1 /2х этажного дома ( дом переделан под квартиры , двор общий для квартирантов ) отдельно спальня и кухня , газ плита , двухконтурный котел , есть генератор , душ кабина , кровать , телевизор , роутер ,во дворе есть беседка .цена до 1 июля 10 т гр можно с небольшим животным или средним но не бойцовской породы .🍑0636207853`;

test('parses compact UAH price from Odessa free-text listing', () => {
  assert.deepEqual(parseHousingPrice(ODESA_LISTING), {
    amount: 10000,
    currency: 'UAH',
    approximate: false,
  });
});

test('parses internet, courtyard, gazebo and pet allowance from Odessa free-text listing', () => {
  assert.deepEqual(parseHousingFeatures(ODESA_LISTING), {
    internet: true,
    courtyard: true,
    gazebo: true,
    petsAllowed: true,
  });
});

test('Uzbek "N ta qiz yashaydi" / "2 tadan" / "N tagacha odam qabul" posts are shared stays', async () => {
  const { parseHousingRoomShare } = await import('../src/housing-listing-enrichment.js');
  assert.equal(parseHousingRoomShare('Jami 6 ta qiz yashaydi 1 xonada 2 tadan qiz turadi 175$ dan'), true);
  assert.equal(parseHousingRoomShare('odam kop 80 tagacha odam qabul qilamiz hovli'), true);
  assert.equal(parseHousingRoomShare('Сдам в аренду однокомнатную квартиру семье на долгий срок'), false);
});
