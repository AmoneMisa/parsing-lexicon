import test from 'node:test';
import assert from 'node:assert/strict';

import { findPhoneLikeSpans, maskPhoneLikeSpans } from '../src/contact.js';
import { parsePriceFromText } from '../src/price.js';

const wantedChernivtsi = `Добрий день! Шукаю 1-к. кв. або підселення в непрохідну окрему кімнату.
Бюджет:
Якщо кімната до 7000 грн
Якщо квартира до 10 000 грн
095 082 01 03 Марія`;

test('phone-like spans are detected without crossing line boundaries', () => {
  const spans = findPhoneLikeSpans(wantedChernivtsi);
  assert.equal(spans.length, 1);
  assert.equal(spans[0].raw, '095 082 01 03');
  assert.equal(spans[0].digits, '0950820103');
  assert.doesNotMatch(maskPhoneLikeSpans(wantedChernivtsi), /095\s+082\s+01\s+03/);
});

test('phone numbers cannot become price candidates in any extraction branch', () => {
  assert.deepEqual(parsePriceFromText(wantedChernivtsi, 'UAH'), {
    price: 10000,
    currency: 'UAH',
  });
});

test('explicit small hard-currency rent remains parseable', () => {
  assert.deepEqual(parsePriceFromText('Аренда: 450$ в месяц', 'UZS'), {
    price: 450,
    currency: 'USD',
  });
});

test('bare Uzbek small rent keeps established USD convention', () => {
  assert.deepEqual(parsePriceFromText('Narx: 450', 'UZS'), {
    price: 450,
    currency: 'USD',
  });
});
