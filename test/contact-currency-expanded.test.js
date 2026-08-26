import test from 'node:test';
import assert from 'node:assert/strict';

import {
  findPhoneLikeSpans,
  normalizePhone,
  parsePhoneNumbers,
} from '../src/contact.js';
import {
  moneyCurrencyCandidatesFromText,
  moneyCurrencyFromText,
} from '../src/currency.js';
import { parseHousingPrice } from '../src/housing-money.js';

test('broad phone detector stays tolerant for money masking', () => {
  assert.equal(findPhoneLikeSpans('тел. (095) 082-01-03').length, 1);
  assert.equal(findPhoneLikeSpans('90 123 45 67').length, 0);
});

test('phone parser normalizes national formats with a country hint', () => {
  assert.equal(normalizePhone('Марія 095 082 01 03', { countryHint: 'UA' })?.number, '+380950820103');
  assert.equal(normalizePhone('Admin 90 123 45 67', { countryHint: 'UZ' })?.number, '+998901234567');
  assert.equal(normalizePhone('0722 123 456', { countryHint: 'RO' })?.number, '+40722123456');
});

test('phone parser accepts international format without a country hint', () => {
  const phones = parsePhoneNumbers('WhatsApp +998 (90) 123-45-67, tel +40 722 123 456');
  assert.deepEqual(phones.map((phone) => phone.number), ['+998901234567', '+40722123456']);
  assert.deepEqual(phones.map((phone) => phone.country), ['UZ', 'RO']);
});

test('invalid numeric sequences are not promoted to normalized phones', () => {
  assert.deepEqual(parsePhoneNumbers('ID 123456789012345 and price 10000000'), []);
});

test('currency aliases cover additional regional and international currencies', () => {
  assert.equal(moneyCurrencyFromText('950 швейцарских франков'), 'CHF');
  assert.equal(moneyCurrencyFromText('1200 юаней'), 'CNY');
  assert.equal(moneyCurrencyFromText('15000 иен'), 'JPY');
  assert.equal(moneyCurrencyFromText('₩ 900000'), 'KRW');
  assert.equal(moneyCurrencyFromText('₹ 50000'), 'INR');
  assert.equal(moneyCurrencyFromText('₼ 1200'), 'AZN');
  assert.equal(moneyCurrencyFromText('֏ 250000'), 'AMD');
});

test('ambiguous symbols use explicit code or fallback currency as context', () => {
  assert.deepEqual(moneyCurrencyCandidatesFromText('$ 900'), ['USD', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD']);
  assert.equal(moneyCurrencyFromText('$ 900', 'CAD'), 'CAD');
  assert.equal(moneyCurrencyFromText('900 CAD $', 'USD'), 'CAD');
  assert.deepEqual(moneyCurrencyCandidatesFromText('¥ 900'), ['JPY', 'CNY']);
  assert.equal(moneyCurrencyFromText('¥ 900', 'CNY'), 'CNY');
  assert.equal(moneyCurrencyFromText('¥ 900', 'JPY'), 'JPY');
});

test('housing price parser consumes expanded currency names without a second parser', () => {
  assert.deepEqual(parseHousingPrice('Аренда 950 CHF в месяц', 'EUR'), {
    price: 950,
    currency: 'CHF',
  });
  assert.deepEqual(parseHousingPrice('Rent 1200 CAD monthly', 'USD'), {
    price: 1200,
    currency: 'CAD',
  });
});
