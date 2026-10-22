import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalAnyCity, canonicalUkraineCity, stripSettlementPrefix } from '../src/index.js';

test('a settlement-type word in front of a city does not make a second city', () => {
  for (const value of ['город Бишкек', 'г. Бишкек', 'Бишкек']) assert.equal(canonicalAnyCity(value, 'KG'), 'Bishkek', value);
  assert.equal(canonicalUkraineCity('місто Київ'), canonicalUkraineCity('Київ'));
  assert.equal(canonicalUkraineCity('город Харьков'), canonicalUkraineCity('Харьков'));
});

test('stripSettlementPrefix only removes a leading type word', () => {
  assert.equal(stripSettlementPrefix('город Токмак'), 'Токмак');
  assert.equal(stripSettlementPrefix('г. Кара-Куль'), 'Кара-Куль');
  assert.equal(stripSettlementPrefix('Город'), 'Город');
  assert.equal(stripSettlementPrefix('Гориция'), 'Гориция');
  assert.equal(stripSettlementPrefix('Ташкент, город'), 'Ташкент, город');
});
