import test from 'node:test';
import assert from 'node:assert/strict';
import { composeHousingAddress, parseHousingAddress } from '../src/housing-address.js';

test('parses explicit Ukrainian street, house and building', () => {
  assert.deepEqual(parseHousingAddress('вул. Воробкевича 12, корпус 2'), {
    address: 'вул. Воробкевича 12 корпус 2',
    street: 'Воробкевича',
    houseNumber: '12',
    building: '2',
    confidence: 1,
  });
});

test('parses labelled bare address without treating arbitrary prose as address', () => {
  const parsed = parseHousingAddress('Адрес: Воробкевича 12-А');
  assert.equal(parsed.street, 'Воробкевича');
  assert.equal(parsed.houseNumber, '12-А');
  assert.equal(parsed.address, 'Воробкевича 12-А');

  assert.deepEqual(parseHousingAddress('Цена 95000, телефон +998 90 123 45 67'), {
    address: null,
    street: null,
    houseNumber: null,
    building: null,
    confidence: 0,
  });
});

test('parses Uzbek and Romanian explicit address markers', () => {
  const uz = parseHousingAddress("Shota Rustaveli ko'chasi 58");
  assert.equal(uz.street, 'Shota Rustaveli');
  assert.equal(uz.houseNumber, '58');

  const ro = parseHousingAddress('Strada Lujerului 42, bloc 3');
  assert.equal(ro.street, 'Lujerului');
  assert.equal(ro.houseNumber, '42');
  assert.equal(ro.building, '3');
});

test('allowBare is reserved for source-provided address fields', () => {
  const parsed = parseHousingAddress('Воробкевича 12', { allowBare: true });
  assert.equal(parsed.street, 'Воробкевича');
  assert.equal(parsed.houseNumber, '12');
  assert.equal(parsed.confidence, 0.85);
});

test('composeHousingAddress produces a stable canonical query string', () => {
  assert.equal(composeHousingAddress({ street: 'Воробкевича', houseNumber: '12', building: '2' }), 'Воробкевича 12 корп. 2');
});
