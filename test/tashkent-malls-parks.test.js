import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TASHKENT_LEGACY_LANDMARKS,
  TASHKENT_MALLS,
  TASHKENT_MARKETS,
  TASHKENT_PARKS,
  TASHKENT_RETAIL_POIS,
  matchTashkentPoi,
} from '../src/tashkent-pois.js';

const canonicalNames = (items) => items.map((entry) => entry.name);

test('Tashkent Atlas venues stay physically distinct', () => {
  const mallNames = canonicalNames(TASHKENT_MALLS);
  assert.equal(mallNames.includes('Atlas Mall'), false);
  assert.equal(mallNames.includes('Atlas Chimgan'), false);
  assert.ok(mallNames.includes('Atlas Chilanzar'));
  assert.ok(mallNames.includes('Atlas Yunusobod'));
  assert.ok(mallNames.includes('Chimgan'));

  assert.equal(matchTashkentPoi('квартира рядом с ТРЦ Atlas Chilanzar', 'malls')?.name, 'Atlas Chilanzar');
  assert.equal(matchTashkentPoi('около Атлас Юнусабад', 'malls')?.name, 'Atlas Yunusobod');
  assert.equal(matchTashkentPoi('Торговый центр Чимган', 'malls')?.name, 'Chimgan');
  assert.equal(matchTashkentPoi('Атлас Чимган', 'retail')?.name, 'Atlas Chimgan');
});

test('Tashkent expanded mall canonicals match verified current venues', () => {
  const names = canonicalNames(TASHKENT_MALLS);
  for (const name of [
    'NEXT Mall',
    'Riviera Mall',
    'Parus Mall',
    'Depo Mall',
    'Vega Centre',
    'Yunusabad Gallery',
    'Poytaxt Mall',
    'Alfraganus Mall',
    'High Town Mall',
    'Seoul Mun Mall',
    'Golden Life',
    "Chig'atoy Mall",
    'Scopus Mall',
  ]) assert.ok(names.includes(name), name);

  assert.equal(matchTashkentPoi('рядом с HT Mall', 'malls')?.name, 'High Town Mall');
  assert.equal(matchTashkentPoi('ТРЦ Samarqand Darvoza', 'malls')?.name, 'Samarkand Darvoza');
  assert.equal(matchTashkentPoi('ТРЦ Golden Life', 'malls')?.name, 'Golden Life');
  assert.equal(matchTashkentPoi("ТРЦ Chig'atoy", 'malls')?.name, "Chig'atoy Mall");
  assert.equal(matchTashkentPoi('ТРЦ Scopus', 'malls')?.name, 'Scopus Mall');
});

test('Tashkent non-mall retail and market venues keep their real categories', () => {
  assert.equal(matchTashkentPoi('Magnum Samarkand Darvoza', 'retail')?.category, 'supermarket');
  assert.equal(matchTashkentPoi('Baraka Market', 'retail')?.category, 'supermarket');
  assert.equal(matchTashkentPoi('Sampi bozori', 'markets')?.name, 'Sampi Bazaar');
  assert.equal(canonicalNames(TASHKENT_MARKETS).includes('Sampi Bazaar'), true);
  assert.equal(canonicalNames(TASHKENT_RETAIL_POIS).includes('Magnum Samarkand Darvoza'), true);
});

test('closed Turkuaz Chorsu remains a legacy landmark instead of a current mall', () => {
  assert.equal(canonicalNames(TASHKENT_MALLS).includes('Turkuaz Chorsu'), false);
  assert.equal(canonicalNames(TASHKENT_LEGACY_LANDMARKS).includes('Turkuaz Chorsu'), true);
  assert.equal(matchTashkentPoi('бывший Turkuaz Chorsu', 'legacy')?.name, 'Turkuaz Chorsu');
});

test('Tashkent park aliases reuse physical owners instead of duplicate canonicals', () => {
  const names = canonicalNames(TASHKENT_PARKS);
  assert.equal(names.includes('Milliy Bog Park'), false);
  assert.equal(names.includes('Bobur Park'), false);

  assert.equal(matchTashkentPoi('рядом с Миллий бог', 'parks')?.name, 'Alisher Navoi National Park');
  assert.equal(matchTashkentPoi('Парк Бабура', 'parks')?.name, 'Friendship Park');
  assert.equal(matchTashkentPoi('Анхор Локомотив', 'parks')?.name, 'Anhor Park');
  assert.equal(matchTashkentPoi('Комплекс Анхор Парк', 'parks')?.name, 'Anhor Park');
  assert.equal(matchTashkentPoi('Lokomotiv Amusement Park', 'parks')?.name, 'Lokomotiv Park');
});

test('Tashkent similarly named friendship parks remain semantically distinct', () => {
  assert.equal(matchTashkentPoi('Dostlik Amusement Park', 'parks')?.name, 'Dostlik Park');
  assert.equal(matchTashkentPoi('Сад Дружбы', 'parks')?.name, 'Friendship Park');
  assert.equal(matchTashkentPoi('Парк Дружбы народов', 'parks')?.name, 'Friendship of Peoples Park');
});
