import test from 'node:test';
import assert from 'node:assert/strict';

import { geographyDisplayName } from '../src/geography-display.js';

test('Russian geography display names cover canonical Tashkent hierarchy', () => {
  assert.equal(geographyDisplayName('Tashkent', 'ru', 'city'), 'Ташкент');
  assert.equal(geographyDisplayName('Yunusabad', 'ru', 'district'), 'Юнусабад');
  assert.equal(geographyDisplayName('Yunusabad-19', 'ru', 'microdistrict'), 'Юнусабад-19');
  assert.equal(geographyDisplayName('Chilanzar-10', 'ru', 'microdistrict'), 'Чиланзар-10');
  assert.equal(geographyDisplayName('Novza', 'ru', 'metro'), 'Новза');
});

test('Russian display names cover geo-catalog named and numbered Tashkent microdistricts', () => {
  assert.equal(geographyDisplayName('Olympia', 'ru', 'microdistrict'), 'Олимпия');
  assert.equal(geographyDisplayName('Dustlik-2', 'ru', 'microdistrict'), 'Дустлик-2');
  assert.equal(geographyDisplayName('Karasu-3', 'ru', 'microdistrict'), 'Карасу-3');
  assert.equal(geographyDisplayName('Traktorsozlar-1', 'ru', 'microdistrict'), 'Тракторсозлар-1');
  assert.equal(geographyDisplayName('TTZ-3', 'ru', 'microdistrict'), 'ТТЗ-3');
  assert.equal(geographyDisplayName('Qiyot', 'ru', 'microdistrict'), 'Кият');
});

test('numbered microdistrict formatter does not invent English labels', () => {
  assert.equal(geographyDisplayName('Yunusabad-19', 'en', 'microdistrict'), 'Yunusabad-19');
  assert.equal(geographyDisplayName('Karasu-3', 'en', 'microdistrict'), 'Karasu-3');
});
