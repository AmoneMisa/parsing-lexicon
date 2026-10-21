import test from 'node:test';
import assert from 'node:assert/strict';

import { findPhoneLikeSpans, maskPhoneLikeSpans } from '../src/contact.js';
import { parseHousingPrice } from '../src/housing-money.js';
import { parseSalary } from '../src/money.js';

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

test('phone numbers cannot become housing price candidates', () => {
  assert.deepEqual(parseHousingPrice(wantedChernivtsi, 'UAH'), { amount: 10000, currency: 'UAH', approximate: false });
});

test('explicit small hard-currency rent remains parseable', () => {
  assert.deepEqual(parseHousingPrice('Аренда: 450$ в месяц', 'UZS'), { amount: 450, currency: 'USD', approximate: false });
});

test('bare Uzbek small rent keeps established USD convention', () => {
  assert.deepEqual(parseHousingPrice('Narx: 450', 'UZS'), { amount: 450, currency: 'USD', approximate: false });
});

test('salary parser preserves shared money behavior after core extraction', () => {
  assert.deepEqual(parseSalary('Salary: 2 500 USD per month'), {
    min: 2500,
    max: 2500,
    currency: 'USD',
    period: 'month',
    gross: null,
    negotiable: false,
    approximate: false,
  });
});

test('a dash-grouped national phone next to a currency is a phone, not a price', () => {
  const text = 'Ціна 47500 у.о. 050-123-45-67';
  assert.equal(maskPhoneLikeSpans(text, ' ', { country: 'UA' }).includes('050-123'), false);
  assert.deepEqual(parseHousingPrice(text, { country: 'UA', currency: 'UAH' }), { amount: 47500, currency: 'USD', approximate: false });
  // A real price range keeps its single separator.
  assert.equal(findPhoneLikeSpans('Цена 500-600 $ в месяц').length, 0);
});

test('a dollar emoji is a dollar sign next to a thousands shorthand', () => {
  assert.deepEqual(parseHousingPrice('СТОИМОСТЬ: 73 т. 💵 торг ☎️063-148-21-07', 'UAH'), { amount: 73_000, currency: 'USD', approximate: false });
});

test('a truncated international phone with an explicit +CC is masked', () => {
  const text = 'Агентство +996 998 880 … Написать';
  assert.equal(findPhoneLikeSpans(text).length, 1);
  assert.equal(maskPhoneLikeSpans(text).includes('998 880'), false);
  // A plus-prefixed price add-on is not a phone.
  assert.equal(findPhoneLikeSpans('9000 грн +1000 грн').length, 0);
});
