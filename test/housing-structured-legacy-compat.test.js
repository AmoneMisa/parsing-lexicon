import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseHousingRoomsFromText,
  parseHousingResidentialComplex,
} from '../src/housing-text.js';

test('shared room parser preserves legacy free-text forms', () => {
  for (const [text, expected] of [
    ['2/4/4', 2],
    ['2³/4/4', 3],
    ['2 / 2 / 3', 3],
    ['Количество комнат: 3', 3],
    ['Комнат 1', 1],
    ['Xonalar soni: 3', 3],
    ['3 xona', 3],
    ['3 хона', 3],
    ['2 бөлме', 2],
    ['двухкомнатная квартира', 2],
    ['трьох кімнатна квартира', 3],
  ]) assert.equal(parseHousingRoomsFromText(text), expected, text);
});

test('shared residential-complex parser preserves marker and headline forms', () => {
  for (const [text, expected] of [
    ['ЖК Манзара Сити 2комнатная новая', 'Манзара Сити'],
    ['ЖК «Assalom Sohil» квартира', 'Assalom Sohil'],
    ['Bobur Residence Яккасарай район квартира', 'Bobur Residence'],
    ['PARKENT AVENUE Мирзо-Улугбекский район', 'PARKENT AVENUE'],
  ]) assert.equal(parseHousingResidentialComplex(text), expected, text);

  assert.equal(parseHousingResidentialComplex('Bez makler kvartira Toshkent'), null);
});
