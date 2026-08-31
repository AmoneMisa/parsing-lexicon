import assert from 'node:assert/strict';
import test from 'node:test';

import { geographyZoneDisplayName } from '../src/geography-zone-display.js';

const tashkent = { country: 'UZ', city: 'Tashkent' };

test('zone display localizes canonical Tashkent map values without consumer dictionaries', () => {
  assert.equal(geographyZoneDisplayName('Karasu', 'ru', tashkent), 'Карасу');
  assert.equal(geographyZoneDisplayName('Chilanzar', 'ru', tashkent), 'Чиланзар');
});

test('zone display preserves numbered canonical suffixes while localizing the base', () => {
  assert.equal(geographyZoneDisplayName('Karasu-3', 'ru', tashkent), 'Карасу-3');
  assert.equal(geographyZoneDisplayName('Chilanzar-20A', 'ru', tashkent), 'Чиланзар-20A');
});

test('zone display resolves source-language locality aliases inside a city scope', () => {
  assert.equal(geographyZoneDisplayName('Карасу массиви', 'ru', tashkent), 'Карасу');
});

test('zone display leaves unknown values untouched rather than fuzzy-matching globally', () => {
  assert.equal(geographyZoneDisplayName('Definitely Unknown Zone', 'ru', tashkent), 'Definitely Unknown Zone');
  assert.equal(geographyZoneDisplayName('Karasu', 'ru', { country: 'RO', city: 'Bucharest' }), 'Karasu');
});
