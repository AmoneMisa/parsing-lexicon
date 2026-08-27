import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyHousingDealType } from '../src/housing-intent.js';
import { looksHousingRoomOnly, resolveHousingPropertyType } from '../src/housing.js';
import { parseHousingAudience, parseHousingAmenities } from '../src/housing-text.js';
import { parsePrimaryContact } from '../src/contact.js';
import { parseHousingPayments, parseHousingSeller } from '../src/housing-structured.js';

test('deal type stays multilingual', () => {
  assert.equal(classifyHousingDealType('Продаю квартиру'), 'sale');
  assert.equal(classifyHousingDealType('Квартира посуточно'), 'shortRent');
  assert.equal(classifyHousingDealType('Уй ижарага берилади'), 'longRent');
  assert.equal(classifyHousingDealType('Пәтер жалға беріледі'), 'longRent');
  assert.equal(classifyHousingDealType("Uy yangi remontdan chiqqan. Oila qo’yiladi. 500$ Makler 50%"), 'longRent');
  assert.equal(classifyHousingDealType('2 хонали 3 этажда ремонти яхши холатда турибди 350$'), 'longRent');
  assert.equal(classifyHousingDealType('Uch tepa 12-kvartalda 1 ta qiz sherikka olinadi'), 'longRent');
});

test('room-only and property semantics stay shared', () => {
  assert.equal(looksHousingRoomOnly('Ищу соседку в комнату'), true);
  assert.equal(looksHousingRoomOnly('Квартира с двумя комнатами'), false);
  assert.equal(resolveHousingPropertyType('Квартира в новом доме'), 'flat');
  assert.equal(resolveHousingPropertyType('hovli sotiladi'), 'house');
  assert.notEqual(resolveHousingPropertyType('uy yangi remontdan chiqqan'), 'house');
});

test('audience, amenities and contacts preserve consumer behavior', () => {
  assert.equal(parseHousingAudience('Квартира только для семьи'), 'family');
  assert.equal(parseHousingAudience('Только для девушек'), 'women');
  assert.deepEqual(parseHousingAmenities('Есть посудомоечная машина, стиральная машина и TV'), ['dishwasher', 'washingMachine', 'television']);
  assert.equal(parsePrimaryContact('Тел: 771443473'), '771443473');
  assert.equal(parsePrimaryContact('Пишите @owner_test'), '@owner_test');
});

test('payment and seller semantics cover Telegram broker shorthand', () => {
  assert.deepEqual(parseHousingPayments('M50%').commission, { required: true, percent: 50 });
  assert.equal(parseHousingSeller('M50%').type, 'agency');
  assert.deepEqual(parseHousingPayments('без комиссии').commission, { required: false, percent: null });
  assert.notEqual(parseHousingSeller('Квартира ЖК NRG BAXT БЕЗ МАКЛЕР!').type, 'agency');
  assert.notEqual(parseHousingSeller('Ижара шартнома йук. Без Маклер').type, 'agency');
});
