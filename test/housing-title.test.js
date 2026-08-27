import test from 'node:test';
import assert from 'node:assert/strict';
import { hasMeaningfulHousingTitle, isGenericHousingTitle } from '../src/housing-title.js';

test('marketplace category headings are generic', () => {
  for (const title of [
    'Long-term apartment rentals, Podilskyi district',
    'Довгострокова оренда квартир, Подільський район',
    'Долгосрочная аренда квартир, Подольский район',
    'Короткострокова оренда квартир',
    'Apartments for rent',
    'Оренда квартир',
    'Аренда',
    'Rentals, Kyiv',
  ]) {
    assert.equal(isGenericHousingTitle(title), true, title);
    assert.equal(hasMeaningfulHousingTitle(title), false, title);
  }
});

test('titles describing an actual property are kept', () => {
  for (const title of [
    '2-к квартира, 54 м², Хрещатик',
    'Аренда уютной квартиры в центре',
    'Сдам 1-комнатную возле метро Пушкинская',
    'Cozy studio near Olimpiiska',
    'Долгосрочная аренда 3-комнатной квартиры',
    'Продам будинок з терасою у Львові',
  ]) {
    assert.equal(isGenericHousingTitle(title), false, title);
    assert.equal(hasMeaningfulHousingTitle(title), true, title);
  }
});

test('a digit anywhere proves the title is specific', () => {
  assert.equal(isGenericHousingTitle('Оренда квартир, 2 кімнати'), false);
});

test('emoji- and punctuation-only titles are not meaningful', () => {
  for (const title of ['🏠🏠🏠', '!!! ***', '   ', '', '—']) {
    assert.equal(hasMeaningfulHousingTitle(title), false, JSON.stringify(title));
  }
});

test('null and undefined are handled', () => {
  assert.equal(hasMeaningfulHousingTitle(null), false);
  assert.equal(hasMeaningfulHousingTitle(undefined), false);
  assert.equal(isGenericHousingTitle(null), false);
});
