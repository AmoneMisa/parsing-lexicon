import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

const dniproResidentials = LOCATION_DICTIONARIES.UA.Dnipro.residentialComplexes;

function byName(name) {
  return dniproResidentials.find((entry) => entry.name === name);
}

test('Dnipro cleaned residential aliases keep Ukrainian, Russian and Latin forms', () => {
  const pikhtovyi = byName('Pikhtovyi');
  assert.ok(pikhtovyi);
  assert.ok(pikhtovyi.aliases.includes('ЖК Пихтовый'));
  assert.ok(pikhtovyi.aliases.includes('ЖК Піхтовий'));
  assert.ok(pikhtovyi.aliases.includes('ЖК Ялицевий'));

  const lighthouse = byName('Lighthouse');
  assert.ok(lighthouse);
  assert.ok(lighthouse.aliases.includes('ЖК Лайтхаус'));
  assert.ok(lighthouse.aliases.includes('Lighthouse Dnipro'));
});

test('cleaned scrape aliases are resolved by the runtime dictionary matcher', () => {
  assert.equal(matchDictionaryLocation('квартира у ЖК Ялицевий', 'UA', 'Dnipro')?.name, 'Pikhtovyi');
  assert.equal(matchDictionaryLocation('продаж в ЖК Лайтхаус', 'UA', 'Dnipro')?.name, 'Lighthouse');
  assert.equal(matchDictionaryLocation('apartment in Palermo residential complex', 'UA', 'Dnipro')?.name, 'Palermo');
  assert.equal(matchDictionaryLocation('ЖК Салют, Дніпро', 'UA', 'Dnipro')?.name, 'Salyut');
});
