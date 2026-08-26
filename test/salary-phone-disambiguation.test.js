import test from 'node:test';
import assert from 'node:assert/strict';

import { parseSalary } from '../src/money.js';

test('labeled phone numbers cannot outrank an explicit salary amount', () => {
  assert.deepEqual(
    parseSalary('Телефон: 095 082 01 03. Бажана зарплата 1200 CAD.'),
    {
      min: 1200,
      max: 1200,
      currency: 'CAD',
      period: null,
      gross: null,
      negotiable: false,
      approximate: false,
    },
  );
});

test('international contact numbers do not become salary candidates', () => {
  assert.deepEqual(
    parseSalary('WhatsApp: +998 90 123 45 67. Salary: 2 500 USD per month'),
    {
      min: 2500,
      max: 2500,
      currency: 'USD',
      period: 'month',
      gross: null,
      negotiable: false,
      approximate: false,
    },
  );
});

test('legitimate grouped salary ranges remain parseable', () => {
  assert.deepEqual(
    parseSalary('Зарплата 100 000 - 120 000 UAH на місяць'),
    {
      min: 100000,
      max: 120000,
      currency: 'UAH',
      period: 'month',
      gross: null,
      negotiable: false,
      approximate: false,
    },
  );
});

test('phone-only contact text is not promoted to salary', () => {
  assert.equal(parseSalary('Телефон: 095 082 01 03'), null);
});
