import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

const cases = [
  ['ЖК Сенатор', 'Senator'],
  ['Бульвар Мурас Нуру', 'Muras Nuru'],
  ['МФК Mansara', 'Mansara'],
  ['ЖК Редженси', 'Regency'],
  ['Ilim+', 'Илим Плюс'],
  ['ЖК Академия', 'Академия'],
  ['Елисейские поля Авангард', 'Елисейские поля'],
  ['ЖК Тянь-Шань-1', 'TIANSHAN-1'],
  ['Анка Тауэр турак жай комплекси', 'Anka Tower'],
  ['ЖК УРПАК', 'УРПАК'],
  ['Кут Урпак', 'УРПАК'],
];

test('Bishkek residential aliases resolve to stable canonical identities', () => {
  for (const [input, canonical] of cases) {
    const match = matchDictionaryLocation(input, 'KG', 'Bishkek');
    assert.equal(match?.type, 'residentialComplexes', input);
    assert.equal(match?.name, canonical, input);
  }
});

test('TIANSHAN-1 stays distinct from the existing Tyan-Shan complex', () => {
  assert.equal(matchDictionaryLocation('ЖК Тянь-Шань-1', 'KG', 'Bishkek')?.name, 'TIANSHAN-1');
  assert.equal(matchDictionaryLocation('ЖК Тянь-Шань', 'KG', 'Bishkek')?.name, 'Тянь-Шань');
});
