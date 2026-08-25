import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultCurrencyForCountry,
  parseHiringSalaryWithContext,
} from '../src/hiring-salary-context.js';

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

test('local currency lookup accepts country aliases', () => {
  assert.equal(defaultCurrencyForCountry('Uzbekistan'), 'UZS');
  assert.equal(defaultCurrencyForCountry('Казахстан'), 'KZT');
  assert.equal(defaultCurrencyForCountry('Україна'), 'UAH');
});
