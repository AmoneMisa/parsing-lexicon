import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES } from '../src/index.js';

const chernivtsi = LOCATION_DICTIONARIES.UA.Chernivtsi;

// Chernivtsi City Council decision No. 1542 of 2015-03-26 abolished the city district
// division effective 2016-01-01. CEC resolution No. 870 of 2019-04-30 confirms the
// cancellation and liquidation of the former Pershotravnevyi, Sadhirskyi and
// Shevchenkivskyi districts: https://zakon.rada.gov.ua/laws/show/v0870359-19

test('Chernivtsi intentionally exposes no current administrative districts', () => {
  assert.ok(chernivtsi);
  assert.deepEqual(chernivtsi.districts ?? [], []);
});

test('former Chernivtsi district names are not current district canonicals', () => {
  const districts = chernivtsi.districts ?? [];
  for (const historicalName of [
    'Першотравневий район',
    'Первомайский район',
    'Садгірський район',
    'Садгорский район',
    'Шевченківський район',
    'Шевченковский район',
  ]) {
    assert.equal(districts.some((entry) => entry.re.test(historicalName)), false, historicalName);
  }
});

test('Sadgora keeps useful historical locality wording without becoming a district', () => {
  const matches = (chernivtsi.microdistricts ?? [])
    .filter((entry) => entry.re.test('Садгірський район'))
    .map((entry) => entry.name);
  assert.deepEqual(matches, ['Sadgora']);
});
