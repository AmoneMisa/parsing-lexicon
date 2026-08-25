import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KZ_EXPANDED_LOCATION_DICTIONARIES,
  matchCentralAsiaLocationEntities,
} from '../src/index.js';

test('same Almaty place name can retain multiple district parents', () => {
  const sairan = KZ_EXPANDED_LOCATION_DICTIONARIES.Almaty.microdistricts.filter((entry) => entry.name === 'Sairan');
  assert.equal(sairan.length, 2);
  assert.deepEqual(new Set(sairan.map((entry) => entry.district)), new Set(['Almaly', 'Auezov']));

  const result = matchCentralAsiaLocationEntities('Сайран, Алматы', 'KZ', 'Almaty');
  const matches = result.matches.filter((entry) => entry.name === 'Sairan');
  assert.equal(matches.length, 2);
  assert.deepEqual(new Set(matches.map((entry) => entry.district)), new Set(['Almaly', 'Auezov']));
});

test('same cross-district area does not invent one parent', () => {
  const result = matchCentralAsiaLocationEntities('Нижняя Пятилетка, Алматы', 'KZ', 'Almaty');
  const matches = result.matches.filter((entry) => entry.name === 'Nizhnyaya Pyatiletka');
  assert.equal(matches.length, 2);
  assert.deepEqual(new Set(matches.map((entry) => entry.district)), new Set(['Zhetysu', 'Turksib']));
});
