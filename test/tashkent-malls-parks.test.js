import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TASHKENT_MALLS,
  TASHKENT_PARKS,
  TASHKENT_RETAIL_POIS,
  matchTashkentPoi,
} from '../src/tashkent-pois.js';

const canonicalNames = (items) => items.map((entry) => entry.name);

test('Tashkent Atlas branches stay distinct mall canonicals', () => {
  const names = canonicalNames(TASHKENT_MALLS);
  assert.equal(names.includes('Atlas Mall'), false);
  assert.ok(names.includes('Atlas Chilanzar'));
  assert.ok(names.includes('Atlas Chimgan'));
  assert.ok(names.includes('Atlas Yunusobod'));

  assert.equal(matchTashkentPoi('квартира рядом с ТРЦ Atlas Chilanzar', 'malls')?.name, 'Atlas Chilanzar');
  assert.equal(matchTashkentPoi('ориентир Atlas Chimgan', 'malls')?.name, 'Atlas Chimgan');
  assert.equal(matchTashkentPoi('около Атлас Юнусабад', 'malls')?.name, 'Atlas Yunusobod');
});

test('Tashkent current mall names preserve legacy aliases without fake mall entities', () => {
  assert.equal(matchTashkentPoi('рядом с HT Mall', 'malls')?.name, 'High Town Mall');
  assert.equal(matchTashkentPoi('ТРЦ Samarqand Darvoza', 'malls')?.name, 'Samarkand Darvoza');
  assert.equal(matchTashkentPoi('Magnum Samarkand Darvoza', 'retail')?.category, 'supermarket');
  assert.equal(matchTashkentPoi('Baraka Market', 'retail')?.category, 'supermarket');
  assert.equal(canonicalNames(TASHKENT_RETAIL_POIS).includes('Magnum Samarkand Darvoza'), true);
});

test('Tashkent park aliases reuse physical owners instead of duplicate canonicals', () => {
  const names = canonicalNames(TASHKENT_PARKS);
  assert.equal(names.includes('Milliy Bog Park'), false);
  assert.equal(names.includes('Bobur Park'), false);

  assert.equal(matchTashkentPoi('рядом с Миллий бог', 'parks')?.name, 'Alisher Navoi National Park');
  assert.equal(matchTashkentPoi('у бывшего Парка Бабура', 'parks')?.name, 'Friendship Park');
  assert.equal(matchTashkentPoi('Анхор Локомотив', 'parks')?.name, 'Anhor Park');
  assert.equal(matchTashkentPoi('Lokomotiv Amusement Park', 'parks')?.name, 'Lokomotiv Park');
});

test('Tashkent similarly named friendship parks remain semantically distinct', () => {
  assert.equal(matchTashkentPoi('Dostlik Amusement Park', 'parks')?.name, 'Dostlik Park');
  assert.equal(matchTashkentPoi('Сад Дружбы', 'parks')?.name, 'Friendship Park');
  assert.equal(matchTashkentPoi('Парк Дружбы народов', 'parks')?.name, 'Friendship of Peoples Park');
});
