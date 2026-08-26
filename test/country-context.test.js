import test from 'node:test';
import assert from 'node:assert/strict';

import {
  countryContext,
  countryCurrency,
  countryPhoneHint,
} from '../src/country-context.js';

test('country context derives currency and phone hint from canonical country catalog', () => {
  assert.deepEqual(countryContext('Украина'), {
    code: 'UA',
    country: 'Ukraine',
    currency: 'UAH',
    phoneCountry: 'UA',
  });
  assert.equal(countryCurrency('UZ'), 'UZS');
  assert.equal(countryCurrency('Canada'), 'CAD');
  assert.equal(countryPhoneHint('România'), 'RO');
  assert.equal(countryPhoneHint('Казахстан'), 'KZ');
});

test('country context does not invent defaults for unknown locations', () => {
  assert.equal(countryContext('Atlantis'), null);
  assert.equal(countryCurrency('Atlantis'), null);
  assert.equal(countryPhoneHint('Atlantis'), null);
});
