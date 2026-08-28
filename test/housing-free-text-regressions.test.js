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
