import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

const CASES = Object.freeze([
  Object.freeze(['Asaka', 'Dehqon bozori', 'landmarks', 'Dehqon Bazaar']),
  Object.freeze(['Kattakurgan', 'Dehqon bozori', 'localAreas', 'Bazaar']),
  Object.freeze(['Kattakurgan', 'Базар', 'localAreas', 'Bazaar']),
  Object.freeze(['Shahrixon', 'рынок', 'localAreas', 'Market']),
]);

test('tail-city market aliases keep stable city-scoped canonicals', () => {
  for (const [city, input, type, canonical] of CASES) {
    const match = matchDictionaryLocation(input, 'UZ', city);
    assert.equal(match?.type, type, `${city}: ${input}`);
    assert.equal(match?.name, canonical, `${city}: ${input}`);
  }
});
