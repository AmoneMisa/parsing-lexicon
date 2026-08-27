import test from 'node:test';
import assert from 'node:assert/strict';
import { detectHousingTextLanguage, housingTextIsInLanguage } from '../src/housing-language.js';

const RU = 'Сдается квартира, 2 комнаты, 5 этаж, рядом метро, коммунальные отдельно';
const UK = 'Здається квартира, 2 кімнати, 5 поверх, поруч метро, комунальні окремо';
const EN = 'Apartment for rent, 2 rooms, 5th floor, near metro, utilities not included';
const UZ = 'Kvartira ijaraga beriladi, 2 xona, 5-qavat, metroga yaqin, narxi kelishilgan';

test('recognises the language a housing text is written in', () => {
  assert.equal(detectHousingTextLanguage(RU), 'ru');
  assert.equal(detectHousingTextLanguage(UK), 'uk');
  assert.equal(detectHousingTextLanguage(EN), 'en');
  assert.equal(detectHousingTextLanguage(UZ), 'uz');
});

test('housingTextIsInLanguage answers the translation question', () => {
  assert.equal(housingTextIsInLanguage(RU, 'ru'), true);
  assert.equal(housingTextIsInLanguage(RU, 'en'), false);
  assert.equal(housingTextIsInLanguage(EN, 'en'), true);
  assert.equal(housingTextIsInLanguage(EN, 'ru'), false);
});

test('Uzbek Cyrillic is not mistaken for Russian', () => {
  const uzCyrl = 'Квартира ижарага берилади, 2 хона, 5-қават, метрога яқин';
  assert.equal(housingTextIsInLanguage(uzCyrl, 'ru'), false);
  assert.equal(detectHousingTextLanguage(uzCyrl), null);
});

test('a single shared word is not enough evidence', () => {
  assert.equal(housingTextIsInLanguage('metro', 'en'), false);
  assert.equal(housingTextIsInLanguage('Метро', 'ru'), false);
});

test('empty and unknown input yields no language', () => {
  assert.equal(detectHousingTextLanguage(''), null);
  assert.equal(detectHousingTextLanguage(null), null);
  assert.equal(detectHousingTextLanguage('zzz qqq'), null);
  assert.equal(housingTextIsInLanguage('', 'ru'), false);
  assert.equal(housingTextIsInLanguage(RU, 'de'), false);
});
