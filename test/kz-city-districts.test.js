import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

const districtNames = (city) => (dictionaryFor('KZ', city)?.districts || []).map(({ name }) => name).sort();

const expectedDistricts = new Map([
  ['Shymkent', ['Abai', 'Al-Farabi', 'Enbekshi', 'Karatau', 'Turan']],
  ['Aktobe', ['Almaty', 'Astana']],
  ['Karaganda', ['Alikhan Bokeikhan', 'Kazybek Bi']],
  ['Taraz', ['Aulieata', 'Zhibek Zholy']],
]);

test('Kazakhstan city district dictionaries expose complete current canonical sets', () => {
  for (const [city, expected] of expectedDistricts) {
    assert.deepEqual(districtNames(city), [...expected].sort(), city);
  }
});

test('current Kazakh and Russian district forms resolve to canonical districts', () => {
  const cases = [
    ['Shymkent', 'квартира в Абай ауданы', 'Abai'],
    ['Shymkent', 'дом в Туранском районе', 'Turan'],
    ['Karaganda', 'квартира в Әлихан Бөкейхан ауданы', 'Alikhan Bokeikhan'],
    ['Karaganda', 'старое объявление: Октябрьский район', 'Alikhan Bokeikhan'],
    ['Aktobe', 'Астана ауданы', 'Astana'],
    ['Aktobe', 'Алматинский район', 'Almaty'],
    ['Taraz', 'Әулиеата ауданы', 'Aulieata'],
    ['Taraz', 'район Жибек жолы', 'Zhibek Zholy'],
  ];

  for (const [city, text, expected] of cases) {
    assert.equal(matchDictionaryLocation(text, 'KZ', city)?.name, expected, `${city}: ${text}`);
  }
});
