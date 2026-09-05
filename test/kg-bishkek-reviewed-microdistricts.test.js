import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

const cases = Object.freeze([
  ['мкр. Джал-15', 'Джал-15'],
  ['микрорайон Учкун', 'Учкун'],
  ['Жилгородок Совмина', 'Жилгородок Совмина'],
]);

test('reviewed Bishkek microdistrict aliases resolve in city scope', () => {
  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KG', 'Bishkek');
    assert.ok(match, text);
    assert.equal(match.type, 'microdistricts');
    assert.equal(match.name, expected, text);
  }
});
