import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

const dniproResidentials = LOCATION_DICTIONARIES.UA.Dnipro.residentialComplexes;
const odesaResidentials = LOCATION_DICTIONARIES.UA.Odesa.residentialComplexes;

function byName(items, name) {
  return items.find((entry) => entry.name === name);
}

test('Dnipro cleaned residential aliases keep Ukrainian, Russian and Latin forms', () => {
  const pikhtovyi = byName(dniproResidentials, 'Pikhtovyi');
  assert.ok(pikhtovyi);
  assert.ok(pikhtovyi.aliases.includes('ЖК Пихтовый'));
  assert.ok(pikhtovyi.aliases.includes('ЖК Піхтовий'));
  assert.ok(pikhtovyi.aliases.includes('ЖК Ялицевий'));

  const lighthouse = byName(dniproResidentials, 'Lighthouse');
  assert.ok(lighthouse);
  assert.ok(lighthouse.aliases.includes('ЖК Лайтхаус'));
  assert.ok(lighthouse.aliases.includes('Lighthouse Dnipro'));
});

test('Odesa cleaned residential aliases keep Ukrainian, Russian and Latin forms', () => {
  const arcPalace = byName(odesaResidentials, 'Arc Palace');
  assert.ok(arcPalace);
  assert.ok(arcPalace.aliases.includes('ЖК Арк Палас'));

  const seventhPearl = byName(odesaResidentials, '7 Pearl');
  assert.ok(seventhPearl);
  assert.ok(seventhPearl.aliases.includes('Седьмая Жемчужина'));
  assert.ok(seventhPearl.aliases.includes('Сьома Перлина'));

  const blueBird = byName(odesaResidentials, 'Synia Ptakh');
  assert.ok(blueBird);
  assert.ok(blueBird.aliases.includes('Синяя птица'));
  assert.ok(blueBird.aliases.includes('Синій птах'));
});

test('cleaned scrape aliases are resolved by the runtime dictionary matcher', () => {
  assert.equal(matchDictionaryLocation('квартира у ЖК Ялицевий', 'UA', 'Dnipro')?.name, 'Pikhtovyi');
  assert.equal(matchDictionaryLocation('продаж в ЖК Лайтхаус', 'UA', 'Dnipro')?.name, 'Lighthouse');
  assert.equal(matchDictionaryLocation('apartment in Palermo residential complex', 'UA', 'Dnipro')?.name, 'Palermo');
  assert.equal(matchDictionaryLocation('ЖК Салют, Дніпро', 'UA', 'Dnipro')?.name, 'Salyut');

  assert.equal(matchDictionaryLocation('оренда у ЖК Арк Палас', 'UA', 'Odesa')?.name, 'Arc Palace');
  assert.equal(matchDictionaryLocation('квартира у Сьома Перлина', 'UA', 'Odesa')?.name, '7 Pearl');
  assert.equal(matchDictionaryLocation('8-я Жемчужина, Одесса', 'UA', 'Odesa')?.name, '8 Pearl');
  assert.equal(matchDictionaryLocation('ЖК Фаворіт', 'UA', 'Odesa')?.name, 'Favorit');
});
