import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

function residentialNames(city) {
  return new Set((dictionaryFor('KZ', city)?.residentialComplexes || []).map(({ name }) => name));
}

test('scrape-backed KZ residential canonicals are merged into runtime dictionaries', () => {
  const astana = residentialNames('Astana');
  for (const name of [
    'Grand Opera',
    'BI City Tokyo',
    'A-City',
    'Акжайык',
    'Астана Жулдызы',
    'Британский квартал',
  ]) {
    assert.ok(astana.has(name), `Astana should contain ${name}`);
  }

  const almaty = residentialNames('Almaty');
  for (const name of ['Esentai City', 'Mega Towers', 'Element']) {
    assert.ok(almaty.has(name), `Almaty should contain ${name}`);
  }
});

test('Russian, Kazakh and Latin residential spellings resolve to stable canonicals', () => {
  const cases = [
    ['Astana', 'ЖК Гранд Опера', 'Grand Opera'],
    ['Astana', 'ЖК Ақжайық', 'Акжайык'],
    ['Astana', 'ЖК BI City Tokyo', 'BI City Tokyo'],
    ['Astana', 'ЖК Сезім Қала', 'Sezim Qala'],
    ['Astana', 'ЖК Астана Жұлдызы', 'Астана Жулдызы'],
    ['Astana', 'ЖК Британский квартал', 'Британский квартал'],
    ['Almaty', 'ЖК Мега Тауэр Алматы', 'Mega Towers'],
    ['Almaty', 'ЖК Есентай Сити', 'Esentai City'],
    ['Almaty', 'ЖК Элемент', 'Element'],
  ];

  for (const [city, text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', city);
    assert.equal(match?.type, 'residentialComplexes', `${city}: ${text}`);
    assert.equal(match?.name, expected, `${city}: ${text}`);
  }
});
