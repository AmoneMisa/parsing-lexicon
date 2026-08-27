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

test('a salary range is not wrongly protected as a phone number after an unrelated word ending in "тел"', () => {
  // "хостел"/"котел" end in the same letters as "тел" (phone), but are not
  // a contact marker — a following number range must still be readable.
  assert.deepEqual(
    parseSalary('Рядом хостел: 95000 - 120000 руб, зарплата достойная'),
    {
      min: 95000,
      max: 120000,
      currency: 'RUB',
      period: null,
      gross: null,
      negotiable: false,
      approximate: false,
    },
  );
});
