import test from 'node:test';
import assert from 'node:assert/strict';

import { KG_KARAKOL_LOCATION_EXTENSIONS } from '../src/kg-karakol-location-extensions.js';

function byCanonical(group, canonical) {
  return group.find((entry) => entry.canonical === canonical);
}

test('reviewed Karakol street aliases preserve distinct canonical identities', () => {
  const streets = KG_KARAKOL_LOCATION_EXTENSIONS.Karakol.streets;
  const cases = [
    ['Улица Ю. Абдрахманова', 'Абдрахманова Ю.улица'],
    ['Арычная улица', 'Арычная улица'],
    ['Улица Н. Айтматовой', 'Айтматовой Н. улица'],
    ['Улица Конкина', 'Конкина улица'],
    ['Улица Кошевого', 'Кошевого улица'],
    ['Улица Кыштобаева', 'Кыштобаева улица'],
    ['Улица Мичурина', 'Мичурина улица'],
    ['Молодёжная улица', 'Молодёжная улица'],
    ['Московская улица', 'Московская улица'],
    ['Улица Садыбекова', 'Садыбекова улица'],
    ['Улица Шапак-баатыра', 'Шапак-баатыра улица'],
    ['Сталинградская улица', 'Сталинградская улица'],
    ['Улица Ворошилова', 'Ворошилова улица'],
    ['Улица Жакшылык', 'Жакшылык улица'],
    ['2-я улица Карасаева', '2-я улица Карасаева'],
    ['Улица Дербишева', 'Улица Дербишева'],
    ['Улица Кадыр аке 1-я', 'Улица Кадыр аке 1-я'],
    ['Улица Кадыр аке 3-я', 'Улица Кадыр аке 3-я'],
    ['Улица Кадыр аке 4-я', 'Улица Кадыр аке 4-я'],
    ['Улица Кадыр аке 5-я', 'Улица Кадыр аке 5-я'],
    ['Каракольская улица', 'Каракольская улица'],
    ['Улица Кутманалиева', 'Улица Кутманалиева'],
    ['Улица Кузбасская 9-я', 'Улица Кузбасская 9-я'],
    ['Улица Кузбасская 10-я', 'Улица Кузбасская 10-я'],
    ['Улица Кузбасская 14-я', 'Улица Кузбасская 14-я'],
    ['Улица Масалиева', 'Улица Масалиева'],
    ['Улица Торгоева', 'Улица Торгоева'],
  ];

  for (const [canonical, observed] of cases) {
    const entry = byCanonical(streets, canonical);
    assert.ok(entry, canonical);
    assert.ok(entry.re.test(observed), `${canonical} should match ${observed}`);
  }

  assert.equal(byCanonical(streets, 'Karakol'), undefined);
});
