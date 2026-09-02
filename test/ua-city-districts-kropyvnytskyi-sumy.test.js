import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES } from '../src/index.js';

const expected = new Map([
  ['Kropyvnytskyi', ['Podilskyi', 'Fortechnyi']],
  ['Sumy', ['Zarichnyi', 'Kovpakivskyi']],
]);

const districts = (city) => LOCATION_DICTIONARIES.UA?.[city]?.districts || [];
const names = (city) => districts(city).map(({ name }) => name).sort();
const match = (city, text) => districts(city).find((entry) => entry.re.test(text))?.name || null;

test('Kropyvnytskyi and Sumy expose complete current district canonical sets', () => {
  for (const [city, canonicals] of expected) {
    assert.deepEqual(names(city), [...canonicals].sort(), city);
  }
});

test('current district phrases resolve in Ukrainian and Russian', () => {
  assert.equal(match('Kropyvnytskyi', 'Подільський район'), 'Podilskyi');
  assert.equal(match('Kropyvnytskyi', 'Фортечный район'), 'Fortechnyi');
  assert.equal(match('Sumy', 'Зарічний район'), 'Zarichnyi');
  assert.equal(match('Sumy', 'Ковпаковский район'), 'Kovpakivskyi');
});

test('historical Kropyvnytskyi district names normalize to current canonicals', () => {
  assert.equal(match('Kropyvnytskyi', 'Ленинский район'), 'Podilskyi');
  assert.equal(match('Kropyvnytskyi', 'Кіровський район'), 'Fortechnyi');
  assert.equal(names('Kropyvnytskyi').includes('Leninskyi'), false);
  assert.equal(names('Kropyvnytskyi').includes('Kirovskyi'), false);
});
