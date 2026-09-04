import test from 'node:test';
import assert from 'node:assert/strict';

import { KG_LOCATION_EXTENSIONS } from '../src/kg-location-extensions.js';

function byCanonical(group, canonical) {
  return group.find((entry) => entry.canonical === canonical);
}

test('Bishkek geography is exposed with stable semantic types', () => {
  const bishkek = KG_LOCATION_EXTENSIONS.Bishkek;

  const tenth = byCanonical(bishkek.microdistricts, '10-й микрорайон');
  assert.ok(tenth);
  assert.equal(tenth.entityType, 'microdistrict');
  assert.ok(tenth.re.test('10 мкр'));

  const kirgiziya = byCanonical(bishkek.localAreas, 'Киргизия-1');
  assert.ok(kirgiziya);
  assert.equal(kirgiziya.entityType, 'local_area');
  assert.ok(kirgiziya.re.test('Киргизия 1'));

  const dastan = byCanonical(bishkek.residentialComplexes, 'Dastan City');
  assert.ok(dastan);
  assert.equal(dastan.entityType, 'residential_complex');
  assert.ok(dastan.re.test('ЖК Дастан Сити'));

  const one = byCanonical(bishkek.residentialComplexes, 'One');
  assert.ok(one);
  assert.ok(one.re.test('ЖК ONE'));

  const kreiser = byCanonical(bishkek.residentialComplexes, 'Крейсер');
  assert.ok(kreiser);
  assert.ok(kreiser.re.test('ЖК Крейсер'));

  const yug7 = byCanonical(bishkek.residentialComplexes, 'Юг-7');
  assert.ok(yug7);
  assert.ok(yug7.re.test('Yug 7'));
});

test('Bishkek residential aliases cover Russian, Kyrgyz and Latin listing forms', () => {
  const residential = KG_LOCATION_EXTENSIONS.Bishkek.residentialComplexes;
  const cases = [
    ['Level Lux', 'Левел Люкс'],
    ['Nuran Park', 'Nuran Park турак жай комплекси'],
    ['Art Square', 'Арт Сквер'],
    ['Kok-Jar Hills', 'Көк-Жар Хиллс'],
    ['Tokyo City', 'ЖК Токио Сити'],
    ['Nova Prestige', 'Нова Престиж'],
    ['Mega City', 'Мега-Сити'],
    ['Sun House Plus', 'SunHouse PLUS'],
    ['Испанский дом', 'Испан үйү'],
    ['Brooklyn', 'Бруклин'],
    ['Barcelona', 'МФК Барселона'],
  ];

  for (const [canonical, alias] of cases) {
    const item = byCanonical(residential, canonical);
    assert.ok(item, canonical);
    assert.ok(item.re.test(alias), `${canonical} should match ${alias}`);
  }
});

test('Bishkek Ak-Ordo spelling resolves through the existing Ak-Orgo semantic entry', () => {
  const entry = byCanonical(KG_LOCATION_EXTENSIONS.Bishkek.microdistricts, 'Ak-Orgo');
  assert.ok(entry);
  assert.ok(entry.re.test('Ак-Ордо'));
  assert.ok(entry.re.test('Ak-Ordo'));
});
