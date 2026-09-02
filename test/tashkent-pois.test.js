import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TASHKENT_MALLS,
  matchTashkentPoi,
} from '../src/tashkent-pois.js';

test('Tashkent Anhor mall and amusement park stay distinct', () => {
  assert.equal(matchTashkentPoi('Анхор Парк', 'malls')?.canonical, 'Anhor Park Mall');
  assert.equal(matchTashkentPoi('Anhor Park Mall', 'malls')?.canonical, 'Anhor Park Mall');
  assert.equal(matchTashkentPoi('Парк Анхор Локомотив', 'parks')?.canonical, 'Anhor Lokomotiv Park');
  assert.equal(matchTashkentPoi('Anhor Lokomotiv', 'parks')?.canonical, 'Anhor Lokomotiv Park');
});

test('Tashkent historical park names collapse to current physical canonicals', () => {
  assert.equal(matchTashkentPoi('Milliy Bog park', 'parks')?.canonical, 'Alisher Navoi National Park');
  assert.equal(matchTashkentPoi('Национальный парк Узбекистана имени Алишера Навои', 'parks')?.canonical, 'Alisher Navoi National Park');
  assert.equal(matchTashkentPoi('Bobur Park', 'parks')?.canonical, 'Dostlik Park');
});

test('Tashkent expanded malls and parks resolve their current names', () => {
  assert.equal(matchTashkentPoi('High Town Mall', 'malls')?.canonical, 'High Town Mall');
  assert.equal(matchTashkentPoi('HT Mall', 'malls')?.canonical, 'High Town Mall');
  assert.equal(matchTashkentPoi('ТРЦ Чимган', 'malls')?.canonical, 'Chimgan Shopping Center');
  assert.equal(matchTashkentPoi('Ботанический сад имени Фёдора Русанова', 'parks')?.canonical, 'Tashkent Botanical Garden');
});

test('supermarkets are not exposed as Tashkent mall canonicals', () => {
  const canonicals = new Set(TASHKENT_MALLS.map((entry) => entry.canonical));
  assert.equal(canonicals.has('Magnum Samarkand Darvoza'), false);
  assert.equal(canonicals.has('Baraka Market'), false);
});
