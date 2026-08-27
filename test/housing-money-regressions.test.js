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

test('currency codes do not match as a substring of an unrelated word', () => {
  // "cad" is a substring of "cadastru" (RO: cadastral record) — it must not
  // be read as a 100 CAD price.
  assert.deepEqual(parseHousingPrice('100 cadastru'), { price: null, currency: '' });
  assert.deepEqual(parseHousingPrice('rent 1200 CAD'), { price: 1200, currency: 'CAD' });
  assert.deepEqual(parseHousingPrice('CAD 1200 rent'), { price: 1200, currency: 'CAD' });
});

test('a currency symbol directly touching its number (no space) still parses', () => {
  // The boundary that blocks "cad" bleeding into "cadastru" must not also
  // reject a digit immediately touching its currency symbol, which is the
  // ordinary way prices are written ("350$", "$100").
  assert.deepEqual(
    parseHousingPrice('2 хонали 3 этажда ремонти яхши холатда турибди 350$', 'UZS'),
    { price: 350, currency: 'USD' },
  );
  assert.deepEqual(parseHousingPrice('rent $100 monthly'), { price: 100, currency: 'USD' });
});
