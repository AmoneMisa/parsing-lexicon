import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES } from '../src/index.js';

const districts = () => LOCATION_DICTIONARIES.UA?.Zhytomyr?.districts || [];
const names = () => districts().map(({ name }) => name).sort();
const match = (text) => districts().find((entry) => entry.re.test(text))?.name || null;

test('Zhytomyr exposes exactly its two current district canonicals', () => {
  assert.deepEqual(names(), ['Bohunskyi', 'Korolovskyi']);
});

test('Zhytomyr Ukrainian and Russian district phrases resolve to current canonicals', () => {
  assert.equal(match('Богунський район'), 'Bohunskyi');
  assert.equal(match('Богунский район'), 'Bohunskyi');
  assert.equal(match('Корольовський район'), 'Korolovskyi');
  assert.equal(match('Королёвский район'), 'Korolovskyi');
  assert.equal(match('Королевский район'), 'Korolovskyi');
});
