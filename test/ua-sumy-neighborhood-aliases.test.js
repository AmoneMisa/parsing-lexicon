import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES } from '../src/index.js';

const microdistricts = LOCATION_DICTIONARIES.UA?.Sumy?.microdistricts || [];
const match = (text) => microdistricts.find((entry) => entry.re.test(text))?.name || null;

test('verified Sumy listing-facing neighborhoods resolve to existing geo canonicals', () => {
  assert.equal(match('мікрорайон Баранівка'), 'Baranivka');
  assert.equal(match('район Баранівка'), 'Baranivka');
  assert.equal(match('Барановка'), 'Baranivka');
  assert.equal(match('район Веретенівки'), 'Veretenivka');
  assert.equal(match('житловий масив Веретенівка'), 'Veretenivka');
  assert.equal(match('Веретеновка'), 'Veretenivka');
});
