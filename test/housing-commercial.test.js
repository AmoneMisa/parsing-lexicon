import assert from 'node:assert/strict';
import test from 'node:test';

import { looksCommercialHousing } from '../src/housing-commercial.js';

test('commercial housing semantics reject non-residential listings across supported languages', () => {
  for (const value of [
    'Сдается офис 80 м2 в центре',
    'Оренда робочого місця для майстра манікюру',
    'Spatiu comercial de inchiriat 120 mp',
    'Ofis ijaraga beriladi, 70 m2',
    '20 sotix yer maydoni sotiladi',
    'Склад ижарага берилади',
    'Кеңсе жалға беріледі 60 м2',
    'Beauty salon for rent',
    'Avtomoyka uchun joy ijaraga beriladi',
  ]) assert.equal(looksCommercialHousing(value), true, value);
});

test('commercial housing semantics do not reject residential listings just because amenities are nearby', () => {
  for (const value of [
    'Сдам 2-комнатную квартиру, магазин рядом',
    'Kvartira ijaraga beriladi, do‘kon yaqinida',
    'Închiriez apartament, birou în apropiere',
    'Пәтер жалға беріледі, дүкен жанында',
  ]) assert.equal(looksCommercialHousing(value), false, value);
});

test('the bare "склад" (warehouse) marker does not match inside unrelated words', () => {
  // "расклад" (schedule/breakdown) contains "склад" as a plain substring;
  // an unbounded match wrongly excluded ordinary rentals that just happened
  // to mention a check-in schedule from the residential feed.
  assert.equal(looksCommercialHousing('Сдам квартиру, есть расклад по датам заезда, звоните'), false);
  assert.equal(looksCommercialHousing('Сдам склад 200 м2 под бизнес'), true);
  assert.equal(looksCommercialHousing('Ищу помещение под склад'), true);
});
