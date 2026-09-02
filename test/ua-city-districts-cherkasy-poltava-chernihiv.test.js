import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES } from '../src/index.js';

const expected = new Map([
  ['Cherkasy', ['Prydniprovskyi', 'Sosnivskyi']],
  ['Poltava', ['Kyivskyi', 'Podilskyi', 'Shevchenkivskyi']],
  ['Chernihiv', ['Desnianskyi', 'Novozavodskyi']],
]);

const districts = (city) => LOCATION_DICTIONARIES.UA?.[city]?.districts || [];
const names = (city) => districts(city).map(({ name }) => name).sort();
const match = (city, text) => districts(city).find((entry) => entry.re.test(text))?.name || null;

test('Cherkasy Poltava and Chernihiv expose complete current district canonical sets', () => {
  for (const [city, canonicals] of expected) {
    assert.deepEqual(names(city), [...canonicals].sort(), city);
  }
});

test('current Ukrainian and Russian district phrases resolve to stable canonicals', () => {
  assert.equal(match('Cherkasy', 'Придніпровський район'), 'Prydniprovskyi');
  assert.equal(match('Cherkasy', 'Сосновский район'), 'Sosnivskyi');
  assert.equal(match('Poltava', 'Київський район'), 'Kyivskyi');
  assert.equal(match('Poltava', 'Подольский район'), 'Podilskyi');
  assert.equal(match('Poltava', 'Шевченківський район'), 'Shevchenkivskyi');
  assert.equal(match('Chernihiv', 'Деснянський район'), 'Desnianskyi');
  assert.equal(match('Chernihiv', 'Новозаводской район'), 'Novozavodskyi');
});

test('historical Poltava names resolve to current districts instead of duplicate canonicals', () => {
  assert.equal(match('Poltava', 'Ленинский район'), 'Podilskyi');
  assert.equal(match('Poltava', 'Октябрський район'), 'Shevchenkivskyi');
  assert.equal(names('Poltava').includes('Leninskyi'), false);
  assert.equal(names('Poltava').includes('Oktiabrskyi'), false);
});
