import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES } from '../src/index.js';

function canonicalNames(city, key) {
  return (LOCATION_DICTIONARIES.UA?.[city]?.[key] || []).map((entry) => entry.name);
}

function resolves(city, key, text) {
  return (LOCATION_DICTIONARIES.UA?.[city]?.[key] || []).find((entry) => entry.re.test(text))?.name || null;
}

test('Berdychiv Korolenka is a street, not a microdistrict', () => {
  assert.equal(canonicalNames('Berdychiv', 'microdistricts').includes('Korolenka'), false);
  assert.equal(resolves('Berdychiv', 'streets', 'вулиця Короленка'), 'Korolenka Street');
  assert.equal(resolves('Berdychiv', 'landmarks', 'Монастир-фортеця ордену босих кармелітів'), 'Berdychiv Monastery');
  assert.equal(resolves('Berdychiv', 'landmarks', 'станція Бердичів'), 'Railway Station');
});

test('Bilhorod-Dnistrovskyi Portovyi is retained as a street discovery', () => {
  assert.equal(canonicalNames('Bilhorod-Dnistrovskyi', 'microdistricts').includes('Portovyi'), false);
  assert.equal(resolves('Bilhorod-Dnistrovskyi', 'streets', 'Портовий провулок'), 'Portovyi Lane');
  assert.equal(resolves('Bilhorod-Dnistrovskyi', 'landmarks', 'Білгород-Дністровська фортеця'), 'Akkerman Fortress');
});

test('Berdiansk sea-port aliases include the direct OSM object name', () => {
  assert.equal(resolves('Berdiansk', 'landmarks', 'Бердянський морський торговельний порт'), 'Sea Port');
});

test('Reni keeps its established Russian alias', () => {
  const reni = LOCATION_DICTIONARIES.UA?.Reni;
  assert.ok(reni);
});
