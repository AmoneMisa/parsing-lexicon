import test from 'node:test';
import assert from 'node:assert/strict';

import { locationCities } from '../src/locations.js';
import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';

const names = (result, type) => result.matches
  .filter((entry) => entry.type === type)
  .map((entry) => entry.name);

test('Tashkent canonical dictionary does not expose unsupported generic massif shells', () => {
  const tashkent = locationCities('UZ').Tashkent;
  const microdistricts = new Set((tashkent.microdistricts || []).map((entry) => entry.name));
  const localAreas = new Map((tashkent.localAreas || []).map((entry) => [entry.name, entry]));

  for (const name of ['Sergeli', 'Yunusabad-20', 'Yunusabad-21', 'Yunusabad-22']) {
    assert.equal(microdistricts.has(name), false, name);
  }

  assert.equal(microdistricts.has('Yunusabad-5'), true);
  assert.equal(microdistricts.has('Sputnik'), true);
  assert.equal(localAreas.get('Qorasuv')?.parent, 'Mirzo Ulugbek');
  assert.equal(microdistricts.has('Qorasuv'), false);
});

test('Tashkent matcher preserves umbrella-area vs numbered-microdistrict semantics', () => {
  const qorasuv = matchCentralAsiaLocationEntities('Qorasuv dahasi, Toshkent', 'UZ', 'Tashkent');
  assert.ok(names(qorasuv, 'local_area').includes('Qorasuv'));
  assert.equal(names(qorasuv, 'microdistrict').includes('Qorasuv'), false);

  const karasu6 = matchCentralAsiaLocationEntities('Qorasuv-6, Toshkent', 'UZ', 'Tashkent');
  assert.ok(names(karasu6, 'microdistrict').includes('Karasu-6'));

  const sputnik = matchCentralAsiaLocationEntities('Sputnik massivi, Toshkent', 'UZ', 'Tashkent');
  assert.ok(names(sputnik, 'microdistrict').includes('Sputnik'));
});
