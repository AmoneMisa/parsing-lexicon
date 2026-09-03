import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultCurrencyForCountry,
  parseHiringSalaryWithContext,
  parseHiringVacancySalary,
} from '../src/hiring-salary-context.js';
import { parseNumericAmount } from '../src/money-core.js';

test('Uzbek salary without explicit currency can use country fallback', () => {
  const salary = parseHiringSalaryWithContext('35 000 000 oylik', {
    country: 'UZ',
    currencyFallback: 'country',
  });
  assert.ok(salary);
  assert.equal(salary.currency, 'UZS');
  assert.equal(salary.currencySource, 'country-default');
  assert.equal(salary.currencyCountry, 'UZ');
  assert.equal(salary.period, 'month');
  assert.equal(salary.min ?? salary.max, 35_000_000);
});

test('explicit currency always wins over geography fallback', () => {
  const salary = parseHiringSalaryWithContext('$2,000 monthly', {
    country: 'UZ',
    currencyFallback: 'country',
  });
  assert.ok(salary);
  assert.equal(salary.currency, 'USD');
  assert.equal(salary.currencySource, 'explicit');
  assert.equal(salary.currencyCountry, null);
  assert.equal(salary.min ?? salary.max, 2_000);
});

test('money numbers distinguish grouped comma thousands from decimal comma values', () => {
  assert.equal(parseNumericAmount('1,500'), 1_500);
  assert.equal(parseNumericAmount('12,500,000'), 12_500_000);
  assert.equal(parseNumericAmount('12,5'), 12.5);
});

test('country fallback remains opt-in', () => {
  const salary = parseHiringSalaryWithContext('35 000 000 oylik', { country: 'UZ' });
  assert.ok(salary);
  assert.equal(salary.currency, null);
  assert.equal(salary.currencySource, 'unknown');
});

test('known city can supply salary currency context', () => {
  const salary = parseHiringSalaryWithContext('35 mln oylik', {
    location: 'Tashkent',
    currencyFallback: 'country',
  });
  assert.ok(salary);
  assert.equal(salary.currency, 'UZS');
  assert.equal(salary.currencyCountry, 'UZ');
});

test('unambiguous Uzbek and Kazakh salary language can infer local currency', () => {
  const uz = parseHiringSalaryWithContext('35 000 000 oylik', { currencyFallback: 'language' });
  assert.ok(uz);
  assert.equal(uz.currency, 'UZS');
  assert.equal(uz.currencySource, 'language-default');

  const kz = parseHiringSalaryWithContext('500 000 айлық', { currencyFallback: 'language' });
  assert.ok(kz);
  assert.equal(kz.currency, 'KZT');
  assert.equal(kz.currencySource, 'language-default');
});

test('generic Russian salary text is not assigned a currency by language', () => {
  const salary = parseHiringSalaryWithContext('зарплата 120 000 в месяц', { currencyFallback: 'language' });
  assert.ok(salary);
  assert.equal(salary.currency, null);
  assert.equal(salary.currencySource, 'unknown');
});

test('local currency lookup accepts country aliases', () => {
  assert.equal(defaultCurrencyForCountry('Uzbekistan'), 'UZS');
  assert.equal(defaultCurrencyForCountry('Казахстан'), 'KZT');
  assert.equal(defaultCurrencyForCountry('Україна'), 'UAH');
});

test('Flagma-style USD range keeps both endpoints and uses UZ monthly fallback', () => {
  const salary = parseHiringVacancySalary('Бухгалтер · 2 700 · - 3 000 · $ · ДИНАРА.С.В., ИП | Астана, KZ · в Ташкенте, удаленно', {
    country: 'UZ',
    periodFallback: 'country',
  });
  assert.ok(salary);
  assert.equal(salary.min, 2_700);
  assert.equal(salary.max, 3_000);
  assert.equal(salary.currency, 'USD');
  assert.equal(salary.period, 'month');
  assert.equal(salary.periodSource, 'country-default');
});

test('explicit Russian monthly marker wins for UZS vacancy salary', () => {
  const salary = parseHiringVacancySalary('Мы предлагаем 1 300 000 UZS в месяц за всего 4 часа работы в день.', {
    country: 'UZ',
    periodFallback: 'country',
  });
  assert.ok(salary);
  assert.equal(salary.min, 1_300_000);
  assert.equal(salary.max, 1_300_000);
  assert.equal(salary.currency, 'UZS');
  assert.equal(salary.period, 'month');
  assert.equal(salary.periodSource, 'explicit');
});
