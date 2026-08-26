import test from 'node:test';
import assert from 'node:assert/strict';

import { extractCandidateContacts } from '../src/hiring-candidate-fields.js';
import { defaultHiringCurrency } from '../src/hiring-source-semantics.js';

test('candidate contacts reuse normalized phone and Telegram parsers with country context', () => {
  assert.deepEqual(
    extractCandidateContacts('Телефон: 095 082 01 03, Telegram: t.me/maria_jobs', 'UA'),
    { phone: '+380950820103', telegram: '@maria_jobs' },
  );
  assert.deepEqual(
    extractCandidateContacts('Aloqa: 90 123 45 67 @dev_user', 'UZ'),
    { phone: '+998901234567', telegram: '@dev_user' },
  );
});

test('hiring default currency is derived from the shared country catalog', () => {
  assert.equal(defaultHiringCurrency('UA'), 'UAH');
  assert.equal(defaultHiringCurrency('Украина'), 'UAH');
  assert.equal(defaultHiringCurrency('Canada'), 'CAD');
  assert.equal(defaultHiringCurrency('Atlantis'), null);
});
