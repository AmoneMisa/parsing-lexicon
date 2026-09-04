import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSING_POI_EXTENSIONS } from '../src/housing-poi-extensions.js';

test('Cherkasy main bus station keeps verified aliases and city scope', () => {
  const station = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Cherkasy Bus Station No. 1');

  assert.ok(station);
  assert.equal(station.category, 'bus_station');
  assert.equal(station.country, 'UA');
  assert.equal(station.city, 'Cherkasy');
  assert.deepEqual(station.aliases.uk, ['Автовокзал «Черкаси»', 'Автовокзал №1', 'Новий автовокзал', 'Автовокзал «Новий»', 'автостанція №1']);
  assert.deepEqual(station.aliases.ru, ['автовокзал Черкассы']);
  assert.deepEqual(station.aliases.en, ['Cherkasy Bus Station No. 1']);
  assert.ok(!station.aliases.uk.includes('Черкаси'));
});

test('Cherkasy bus station No. 2 keeps verified local aliases and city scope', () => {
  const station = HOUSING_POI_EXTENSIONS.find((entry) => entry.canonical === 'Cherkasy Bus Station No. 2');

  assert.ok(station);
  assert.equal(station.category, 'bus_station');
  assert.equal(station.country, 'UA');
  assert.equal(station.city, 'Cherkasy');
  assert.deepEqual(station.aliases.uk, ['Автостанція «Черкаси-2»', 'Черкаси АС-2', 'Автовокзал-2', 'Автовокзал №2', 'автостанція №2']);
  assert.deepEqual(station.aliases.en, ['Cherkasy Bus Station No. 2']);
  assert.ok(!station.aliases.uk.includes('Черкаси'));
});
