import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyHousingSingleMSpans,
  HOUSING_NUMERIC_SPAN_TYPES,
} from '../src/housing-numeric-spans.js';
import { parseHousingPrice } from '../src/housing-money.js';
import { parseHousingStructured } from '../src/housing-structured.js';

const types = (text, options) => classifyHousingSingleMSpans(text, options).map((span) => span.type);

test('single-m spans are typed before money parsing', () => {
  assert.deepEqual(types('metro 800m', { country: 'UZ', dealType: 'sale' }), [
    HOUSING_NUMERIC_SPAN_TYPES.DISTANCE,
  ]);
  assert.deepEqual(types('800m metro', { country: 'UZ', dealType: 'sale' }), [
    HOUSING_NUMERIC_SPAN_TYPES.DISTANCE,
  ]);
  assert.deepEqual(types('umumiy maydon 80m', { country: 'UZ', dealType: 'sale' }), [
    HOUSING_NUMERIC_SPAN_TYPES.AREA,
  ]);
  assert.deepEqual(types('606m/r', { country: 'UA' }), [
    HOUSING_NUMERIC_SPAN_TYPES.MICRODISTRICT,
  ]);
  assert.deepEqual(types('800m', { country: 'UZ', dealType: 'sale' }), [
    HOUSING_NUMERIC_SPAN_TYPES.MONEY,
  ]);
  assert.deepEqual(types("80m uzbek so'm", { country: 'UZ' }), [
    HOUSING_NUMERIC_SPAN_TYPES.MONEY,
  ]);
  assert.deepEqual(types('1200m', { country: 'UA', dealType: 'sale' }), [
    HOUSING_NUMERIC_SPAN_TYPES.UNKNOWN,
  ]);
});

test('Uzbek sale price parser keeps distance spans out of bare-number fallback', () => {
  assert.deepEqual(parseHousingPrice('800000000', { country: 'UZ', dealType: 'sale' }), {
    amount: 800_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('800m', { country: 'UZ', dealType: 'sale' }), {
    amount: 800_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('metro 800m', { country: 'UZ', dealType: 'sale' }), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('800m metro', { country: 'UZ', dealType: 'sale' }), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('1200m metro', { country: 'UZ', dealType: 'sale' }), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('800m metro, 950m', { country: 'UZ', dealType: 'sale' }), {
    amount: 950_000_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('explicit price or currency can classify spaced m as million without global ambiguity', () => {
  assert.deepEqual(parseHousingPrice('Narxi 950 m', { country: 'UZ' }), {
    amount: 950_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('price 2m', { country: 'US' }), {
    amount: 2_000_000,
    currency: 'USD',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('2m USD', { country: 'US' }), {
    amount: 2_000_000,
    currency: 'USD',
    approximate: false,
  });
});

test('structured parser accepts source deal type as money context', () => {
  const parsed = parseHousingStructured('800m', { country: 'UZ', dealType: 'sale' });
  assert.equal(parsed.price.amount, 800_000_000);
  assert.equal(parsed.price.currency, 'UZS');
});
