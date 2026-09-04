import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';
import { KZ_ALMATY_CLEANED_RESIDENTIAL_EXTENSIONS } from '../src/kz-almaty-cleaned-residential-extensions.js';

const names = () => new Set((dictionaryFor('KZ', 'Almaty')?.residentialComplexes || []).map(({ name }) => name));

test('remaining cleaned Almaty residential batch is complete', () => {
  const imported = KZ_ALMATY_CLEANED_RESIDENTIAL_EXTENSIONS.Almaty.residentialComplexes;
  assert.equal(imported.length, 41);

  const almaty = names();
  for (const name of [
    'Alma City 4',
    'Centrium',
    'Dragon City',
    'Galileo Terrace',
    'Nurlitau Hills',
    'А-Элита',
    'Аль-Фараби',
    'Кокжиек',
    'Манхэттен',
    'Медеу Парк',
    'Тау Шатыр',
    'Шугыла',
    'Юбилейный',
  ]) {
    assert.ok(almaty.has(name), `Almaty should contain residential complex ${name}`);
  }
});

test('cleaned Almaty spelling variants resolve to residential canonicals', () => {
  const cases = [
    ['ЖК Алма Сити 4', 'Alma City 4'],
    ['ЖК Айгерім', 'Айгерим'],
    ['ЖК Ақниет', 'Акниет'],
    ['ЖК Әл-Фараби', 'Аль-Фараби'],
    ['ЖК Көкжиек', 'Кокжиек'],
    ['ЖК Manhattan', 'Манхэттен'],
    ['ЖК Сұңқар', 'Сункар'],
    ['ЖК Хан Тәңірі', 'Хан-Тенгри'],
    ['ЖК Шұғыла', 'Шугыла'],
    ['жилой комплекс Молодёжный', 'Молодежный'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Almaty');
    assert.equal(match?.type, 'residentialComplexes', text);
    assert.equal(match?.name, expected, text);
  }
});

test('bare neighborhood labels keep their existing microdistrict owner', () => {
  const cases = [
    ['Көкжиек', 'Kokzhiek'],
    ['Хан Тәңірі', 'Khan Tengri'],
    ['Шұғыла', 'Shugyla'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Almaty');
    assert.equal(match?.type, 'microdistricts', text);
    assert.equal(match?.name, expected, text);
  }
});

test('existing Almaty residential canonical owners are not duplicated', () => {
  const cases = [
    ['ЖК Алма Сити', 'Alma City'],
    ['ЖК Браун', 'Braun'],
    ['ЖК Dostyk Residence', 'Dostyk Residence'],
    ['ЖК Элемент', 'Element'],
    ['ЖК Есентай Сити', 'Esentai City'],
    ['ЖК Хайд Парк', 'Hyde Park'],
    ['ЖК RAMS City', 'Rams City'],
    ['ЖК Мега Тауэр Алматы', 'Mega Towers'],
    ['ЖК Симфония', 'Symphony'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Almaty');
    assert.equal(match?.type, 'residentialComplexes', text);
    assert.equal(match?.name, expected, text);
  }
});
