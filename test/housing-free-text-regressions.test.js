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

test('dormitories, "for 1 person", boys-only quarters and per-room price lists are shared stays', async () => {
  const { parseHousingRoomShare } = await import('../src/housing-listing-enrichment.js');
  for (const text of [
    'Talabalar uchun yotoqxona 1 000 000 so‘m',
    'Аренда Студентла учун Ётоккона 100 м²',
    'Kvartira bor 1 kishiga 90 d',
    'Tuzel metroga 100 metir sherelika kerak',
    'Faqat ogil bollarga qizla bezovta qmela',
    'Комната А — 800$, комната Б — 700$. Проживание студентов',
    '1-xona - 800 ming, 2-xona - 700 ming',
    'Сдам общежитие для рабочих',
  ]) assert.equal(parseHousingRoomShare(text), true, text);
  for (const text of [
    'Сдам 2-комнатную квартиру семье, 500$',
    'Ijaraga 3 xonali kvartira 400$',
    'Квартира для семьи, комната 1 - спальня 12 м2, комната 2 - зал 18 м2 цена 500$',
    'Bollar uchun bog‘cha yonida kvartira',
  ]) assert.equal(parseHousingRoomShare(text), false, text);
});
