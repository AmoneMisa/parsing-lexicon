import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

function byName(group, name) {
  return (group || []).find((entry) => entry.name === name);
}

test('reviewed Manas residential owners use current city identity', () => {
  const manas = dictionaryFor('KG', 'Manas');
  assert.ok(manas);
  assert.equal(dictionaryFor('KG', 'Jalal-Abad'), manas);

  for (const [name, text] of [
    ['Асман Резиденс 1', 'квартира в ЖК Асман Резиденс 1'],
    ['Асман Резиденс 9', 'квартира в ЖК Асман Резиденс 9'],
  ]) {
    assert.ok(byName(manas.residentialComplexes, name), name);
    const match = matchDictionaryLocation(text, 'KG', 'Manas');
    assert.ok(match, text);
    assert.equal(match.type, 'residentialComplexes');
    assert.equal(match.name, name);
  }

  assert.equal(byName(manas.residentialComplexes, 'Асман Резиденс 4'), undefined);
});

test('reviewed and reclassified Manas streets resolve as streets', () => {
  const manas = dictionaryFor('KG', 'Manas');
  const cases = [
    ['10-я улица Электорон', 'дом на 10-я улица Электорон'],
    ['2-я улица ПТФ', 'дом на 2-я улица ПТФ'],
    ['5-я улица Электорон', 'дом на 5-я улица Электорон'],
    ['Абдукаимов көчөсү', 'үй Абдукаимов көчөсү'],
    ['Улица Арстанбаева 1-я', 'дом на улице Арстанбаева 1-я'],
    ['Улица Арстанбаева 2-я', 'дом на улице Арстанбаева 2-я'],
    ['Барпы Рысбаев көчөсү', 'үй Барпы Рысбаев көчөсү'],
    ['Улица Чынгыза Айтматова 3 1-я', 'дом на улице Чынгыза Айтматова 3 1-я'],
    ['Улица Чынгыза Айтматова 3 3-я', 'дом на улице Чынгыза Айтматова 3 3-я'],
    ['Улица Чынгыза Айтматова 3 5-я', 'дом на улице Чынгыза Айтматова 3 5-я'],
    ['Фабричная көчөсү', 'үй Фабричная көчөсү'],
    ['Куренкеев көчөсү', 'үй Куренкеев көчөсү'],
    ['Улица Курортная', 'дом на ул. Курортная'],
    ['Лесная улица', 'дом на Лесной улице'],
    ['Островский көчөсү', 'үй Островский көчөсү'],
    ['Проспект Тумонбая Байзакова', 'дом на проспекте Тумонбая Байзакова'],
    ['Умаркулов Саке көчөсү', 'үй Умаркулов Саке көчөсү'],
    ['Улица Жени-Жок', 'дом на улице Жени-Жок'],
    ['Мурзакулов Урубай көчөсү', 'үй Мурзакулов Урубай көчөсү'],
    ['Пролетар көчөсү', 'үй Пролетар көчөсү'],
    ['Тоголок Молдо көчөсү', 'үй Тоголок Молдо көчөсү'],
  ];

  for (const [name, text] of cases) {
    assert.ok(byName(manas.streets, name), name);
    const match = matchDictionaryLocation(text, 'KG', 'Manas');
    assert.ok(match, text);
    assert.equal(match.type, 'streets');
    assert.equal(match.name, name);
  }
});

test('mis-scoped frozen candidates do not become Manas owners', () => {
  const manas = dictionaryFor('KG', 'Manas');
  assert.equal(byName(manas.microdistricts, '3-садик Мкр Курманбек'), undefined);
  assert.equal(byName(manas.streets, 'Улица Пахта-Абад'), undefined);
  assert.equal(byName(manas.streets, 'Жалабадская улица'), undefined);
  for (const name of ['Базар-Коргонский район', 'Сузакский район', 'станция Жалал-Абад', 'станция Жалал-Абад Южный', 'ПЭС Жалал Абад электро', 'Жалал-Абад электро', 'туннель Жалал-Абад']) {
    assert.equal(byName(manas.districts, name), undefined, name);
  }
});
