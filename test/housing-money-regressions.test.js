import test from 'node:test';
import assert from 'node:assert/strict';

import {parseHousingPrice, parseHousingPricePerSqm} from '../src/housing-money.js';

test('housing multipliers do not match measurement or word prefixes', () => {
  assert.deepEqual(parseHousingPrice('Yunusobod 500 m2 hovli sotiladi', 'UZS'), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('Sergele metroda 5 minut metroga piyoda', 'UZS'), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
});

test('housing multipliers still parse complete scale words', () => {
  assert.deepEqual(parseHousingPrice('Цена 5 миллионов', 'UZS'), {
    amount: 5_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('Narxi 200 000 kunlik', 'UZS'), {
    amount: 200_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('per-square-meter amounts are not treated as total listing prices', () => {
  assert.deepEqual(
    parseHousingPrice('Цена: Гибрид/Ипотека на стадии строительство 18%/ рассрочка От 13 млн за м2 Эксклюзив', 'UZS'),
    {amount: null, currency: 'UZS', approximate: false},
  );
  assert.deepEqual(
    parseHousingPrice('Цена 13 000 000 сум за м²', 'UZS'),
    {amount: null, currency: 'UZS', approximate: false},
  );
  assert.deepEqual(
    parseHousingPrice('Sale price $1200/m2', 'USD'),
    {amount: null, currency: 'USD', approximate: false},
  );
  assert.deepEqual(
    parseHousingPrice('Цена 45 000$; также 13 млн сум за м2', 'UZS'),
    {amount: 45_000, currency: 'USD', approximate: false},
  );
});

test('parses Uzbek classifieds split-million notation', () => {
  assert.deepEqual(
    parseHousingPrice('2 хона 2 млн 500 + агентство хизмати', 'UZS'),
    { amount: 2_500_000, currency: 'UZS', approximate: false },
  );
  assert.deepEqual(parseHousingPrice('ijara 3 mln 250', 'UZS'), {
    amount: 3_250_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('currency codes do not match as a substring of an unrelated word', () => {
  // "cad" is a substring of "cadastru" (RO: cadastral record) — it must not
  // be read as a 100 CAD price.
  assert.deepEqual(parseHousingPrice('100 cadastru'), { amount: null, currency: '', approximate: false });
  assert.deepEqual(parseHousingPrice('rent 1200 CAD'), { amount: 1200, currency: 'CAD', approximate: false });
  assert.deepEqual(parseHousingPrice('CAD 1200 rent'), { amount: 1200, currency: 'CAD', approximate: false });
});

test('a currency symbol directly touching its number (no space) still parses', () => {
  // The boundary that blocks "cad" bleeding into "cadastru" must not also
  // reject a digit immediately touching its currency symbol, which is the
  // ordinary way prices are written ("350$", "$100").
  assert.deepEqual(
    parseHousingPrice('2 хонали 3 этажда ремонти яхши холатда турибди 350$', 'UZS'),
    { amount: 350, currency: 'USD', approximate: false },
  );
  assert.deepEqual(parseHousingPrice('rent $100 monthly'), { amount: 100, currency: 'USD', approximate: false });
});

test('dotted currency suffix parses as money but payment amounts stay out of listing price', () => {
  assert.deepEqual(parseHousingPrice('Аренда 800$, депозит 500.$', 'USD'), {
    amount: 800,
    currency: 'USD',
    approximate: false,
  });
  assert.deepEqual(parseHousingPrice('Uyning depaziti xam bor 500.$', 'USD'), {
    amount: null,
    currency: 'USD',
    approximate: false,
  });
});

test('marks an approximate price when the text hedges the amount', () => {
  assert.deepEqual(parseHousingPrice('Цена около 800$'), { amount: 800, currency: 'USD', approximate: true });
});

test('sale price per square meter is not parsed as the listing total', () => {
  const text = 'Цена: Гибрид/Ипотека на стадии строительство 18%/рассрочка От 13 млн за м2 Эксклюзив';

  assert.deepEqual(parseHousingPrice(text, 'UZS'), {
    amount: null,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPricePerSqm(text, 'UZS'), {
    amount: 13_000_000,
    currency: 'UZS',
    approximate: false,
  });
});

test('per-square-meter parser supports explicit currencies and common unit forms', () => {
  assert.deepEqual(parseHousingPricePerSqm('13 000 000 сум/м²', 'USD'), {
    amount: 13_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPricePerSqm('price per sqm: 1,100 USD'), {
    amount: 1100,
    currency: 'USD',
    approximate: false,
  });
});

test('a total sale price still wins when a separate per-square-meter quote is present', () => {
  const text = 'Цена 572 млн сум, 13 млн сум за м2';
  assert.deepEqual(parseHousingPrice(text, 'UZS'), {
    amount: 572_000_000,
    currency: 'UZS',
    approximate: false,
  });
  assert.deepEqual(parseHousingPricePerSqm(text, 'UZS'), {
    amount: 13_000_000,
    currency: 'UZS',
    approximate: false,
  });
});
