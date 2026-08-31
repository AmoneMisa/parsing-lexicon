import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

const names = (country, city) => (dictionaryFor(country, city)?.districts || []).map(({ name }) => name).sort();

const expected = new Map([
  ['UA:Kyiv', ['Darnytskyi', 'Desnianskyi', 'Dniprovskyi', 'Holosiivskyi', 'Obolonskyi', 'Pecherskyi', 'Podilskyi', 'Shevchenkivskyi', 'Solomianskyi', 'Sviatoshynskyi']],
  ['UA:Odesa', ['Khadzhybeiskyi', 'Kyivskyi', 'Peresypskyi', 'Prymorskyi']],
  ['UA:Dnipro', ['Amur-Nyzhnodniprovskyi', 'Chechelivskyi', 'Industrialnyi', 'Novokodatskyi', 'Samarskyi', 'Shevchenkivskyi', 'Sobornyi', 'Tsentralnyi']],
  ['KG:Bishkek', ['Leninsky', 'Oktyabrsky', 'Pervomaisky', 'Sverdlovsky']],
  ['KZ:Almaty', ['Alatau', 'Almaly', 'Auezov', 'Bostandyk', 'Medeu', 'Nauryzbay', 'Turksib', 'Zhetysu']],
  ['KZ:Astana', ['Almaty', 'Baikonur', 'Esil', 'Nura', 'Saraishyk', 'Saryarka']],
  ['RO:Bucharest', ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6']],
]);

test('priority city district dictionaries expose current canonical sets', () => {
  for (const [key, districtNames] of expected) {
    const [country, city] = key.split(':');
    assert.deepEqual(names(country, city), [...districtNames].sort(), key);
  }
});

test('Samarkand and Bukhara do not expose invented administrative districts', () => {
  assert.deepEqual(names('UZ', 'Samarkand'), []);
  assert.deepEqual(names('UZ', 'Bukhara'), []);
});

test('Bishkek district aliases normalize to canonical district names', () => {
  assert.equal(matchDictionaryLocation('квартира, Первомайский район', 'KG', 'Bishkek')?.name, 'Pervomaisky');
  assert.equal(matchDictionaryLocation('Бишкек, Октябрь району', 'KG', 'Bishkek')?.name, 'Oktyabrsky');
  assert.equal(matchDictionaryLocation('Свердловский район', 'KG', 'Bishkek')?.name, 'Sverdlovsky');
});
