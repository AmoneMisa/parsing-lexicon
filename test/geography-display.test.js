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

test('numbered microdistrict formatter does not invent English labels', () => {
  assert.equal(geographyDisplayName('Yunusabad-19', 'en', 'microdistrict'), 'Yunusabad-19');
});
