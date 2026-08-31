import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  return matchDictionaryLocation(text, 'UA', city);
}

test('Kharkiv major streets resolve across current Ukrainian and Russian forms', () => {
  const cases = new Map([
    ['вулиця Гвардійців-Широнінців', 'Hvardiitsiv-Shyronintsiv Street'],
    ['ул. Гвардейцев-Широнинцев', 'Hvardiitsiv-Shyronintsiv Street'],
    ['проспект Ювілейний', 'Yuvileinyi Avenue'],
    ['проспект Юбилейный', 'Yuvileinyi Avenue'],
    ['проспект Тракторобудівників', 'Traktorobudivnykiv Avenue'],
    ['проспект Тракторостроителей', 'Traktorobudivnykiv Avenue'],
    ['проспект Льва Ландау', 'Lva Landau Avenue'],
    ['Аерокосмічний проспект', 'Aerokosmichnyi Avenue'],
    ['Аэрокосмический проспект', 'Aerokosmichnyi Avenue'],
    ['вулиця Амосова', 'Amosova Street'],
    ['улица Амосова', 'Amosova Street'],
  ]);

  for (const [alias, canonical] of cases) {
    const result = match('Kharkiv', alias);
    assert.equal(result?.type, 'streets');
    assert.equal(result?.name, canonical);
  }
});

test('Kharkiv historical street names resolve to current street canonicals', () => {
  const cases = new Map([
    ['проспект 50-летия ВЛКСМ', 'Yuvileinyi Avenue'],
    ['проспект 50-летия СССР', 'Lva Landau Avenue'],
    ['проспект Гагаріна', 'Aerokosmichnyi Avenue'],
    ['проспект Гагарина', 'Aerokosmichnyi Avenue'],
    ['улица Корчагинцев', 'Amosova Street'],
    ['вулиця Корчагінців', 'Amosova Street'],
  ]);

  for (const [alias, canonical] of cases) {
    const result = match('Kharkiv', alias);
    assert.equal(result?.type, 'streets');
    assert.equal(result?.name, canonical);
  }
});

test('explicit Haharina avenue wording beats the homonymous listing area', () => {
  const street = match('Kharkiv', 'проспект Гагаріна');
  assert.equal(street?.type, 'streets');
  assert.equal(street?.name, 'Aerokosmichnyi Avenue');

  const area = match('Kharkiv', 'Гагаріна');
  assert.equal(area?.type, 'microdistricts');
  assert.equal(area?.name, 'Haharina');
});

test('Kharkiv street aliases stay city-scoped', () => {
  for (const alias of ['проспект Ювілейний', 'проспект Тракторостроителей', 'улица Корчагинцев']) {
    const result = match('Kyiv', alias);
    assert.notEqual(result?.type, 'streets');
  }
});
