import test from 'node:test';
import assert from 'node:assert/strict';

import {parseHousingPrice} from '../src/housing-money.js';

test('housing multipliers do not match measurement or word prefixes', () => {
  assert.deepEqual(parseHousingPrice('Yunusobod 500 m2 hovli sotiladi', 'UZS'), {
    price: null,
    currency: 'UZS',
  });
  assert.deepEqual(parseHousingPrice('Sergele metroda 5 minut metroga piyoda', 'UZS'), {
    price: null,
    currency: 'UZS',
  });
});

test('housing multipliers still parse complete scale words', () => {
  assert.deepEqual(parseHousingPrice('Цена 5 миллионов', 'UZS'), {
    price: 5_000_000,
    currency: 'UZS',
  });
  assert.deepEqual(parseHousingPrice('Narxi 200 000 kunlik', 'UZS'), {
    price: 200_000,
    currency: 'UZS',
  });
});
