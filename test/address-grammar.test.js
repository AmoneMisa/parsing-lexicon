import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BUILDING_MARKERS,
  COUNTRY_ADDRESS_LANGUAGES,
  HOUSE_MARKERS,
  STREET_POSTFIX_MARKERS,
  STREET_PREFIX_MARKERS,
  STREET_TYPE_MARKERS,
  combinedMarkerPattern,
  matchesCountryAddressLanguage,
} from '../src/address-grammar.js';

test('every marker group is tagged with a known language and a usable regex fragment', () => {
  const knownLanguages = new Set(['ru', 'uk', 'ro', 'en', 'kk', 'ky', 'uzLatn', 'uzCyrl']);
  for (const group of [STREET_PREFIX_MARKERS, STREET_POSTFIX_MARKERS, STREET_TYPE_MARKERS, HOUSE_MARKERS, BUILDING_MARKERS]) {
    assert.ok(group.length > 0);
    for (const marker of group) {
      assert.ok(knownLanguages.has(marker.lang), `unexpected language: ${marker.lang}`);
      assert.doesNotThrow(() => new RegExp(marker.pattern, 'iu'), `invalid pattern: ${marker.pattern}`);
    }
  }
});

test('combinedMarkerPattern joins every fragment into one matchable alternation', () => {
  const pattern = new RegExp(`(?:${combinedMarkerPattern(STREET_PREFIX_MARKERS)})`, 'iu');
  assert.ok(pattern.test('ул'));
  assert.ok(pattern.test('street'));
  assert.ok(pattern.test('көше'));
});

test('matchesCountryAddressLanguage scopes to the supplied country\'s priority languages', () => {
  assert.equal(matchesCountryAddressLanguage("Shimoliy Olmazor ko'chasi", 'UZ', STREET_POSTFIX_MARKERS), true);
  assert.equal(matchesCountryAddressLanguage('көше маркер жоқ', 'UZ', STREET_PREFIX_MARKERS), false);
  assert.equal(matchesCountryAddressLanguage('Абай көшесі', 'KZ', STREET_PREFIX_MARKERS), true);
  assert.equal(matchesCountryAddressLanguage('no country supplied', null, STREET_PREFIX_MARKERS), false);
  assert.equal(matchesCountryAddressLanguage('text', 'ZZ', STREET_PREFIX_MARKERS), false);
});

test('every priority country in COUNTRY_ADDRESS_LANGUAGES lists at least one language', () => {
  for (const [country, languages] of Object.entries(COUNTRY_ADDRESS_LANGUAGES)) {
    assert.ok(languages.length > 0, country);
  }
});
