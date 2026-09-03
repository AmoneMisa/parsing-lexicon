import test from 'node:test';
import assert from 'node:assert/strict';

import { TASHKENT_METRO, canonicalTashkentMetro } from '../src/geo.js';

test('Tashkent metro catalog contains all current stations across four lines', () => {
  assert.equal(TASHKENT_METRO.length, 50);
  const counts = TASHKENT_METRO.reduce((acc, station) => {
    acc[station.line] = (acc[station.line] || 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(counts, { chilonzor: 17, ozbekiston: 11, yunusobod: 8, circle: 14 });
});

test('historical and colloquial Tashkent metro aliases canonicalize in the lexicon', () => {
  assert.equal(canonicalTashkentMetro('Хамза'), 'Novza');
  assert.equal(canonicalTashkentMetro('Hamza'), 'Novza');
  assert.equal(canonicalTashkentMetro('Максима Горького'), 'Buyuk Ipak Yoli');
  assert.equal(canonicalTashkentMetro('БИЙ'), 'Buyuk Ipak Yoli');
  assert.equal(canonicalTashkentMetro('Bunyodkor'), 'Xalqlar Dostligi');
  assert.equal(canonicalTashkentMetro('Куйлюк'), 'Qoyliq');
});
