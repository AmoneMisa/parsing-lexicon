import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

const streetCases = [
  ['улица Героев Труда', 'Neskorenykh Street'],
  ['вулиця Героїв Праці', 'Neskorenykh Street'],
  ['улица Дружбы Народов', 'Sobornosti Ukrainy Street'],
  ['вулиця Пєшкова', 'Tarasa Redkina Street'],
  ['улица Пешкова', 'Tarasa Redkina Street'],
  ['улица Родниковая', 'Yany Chervonoi Street'],
  ['вулиця Наталії Ужвій', 'Natalii Uzhvii Street'],
  ['улица Наталии Ужвий', 'Natalii Uzhvii Street'],
  ['вулиця Владислава Зубенка', 'Vladyslava Zubenka Street'],
  ['улица Василия Стуса', 'Vasylia Stusa Street'],
  ['вулиця Бучми', 'Buchmy Street'],
  ['вулиця Нескорених', 'Neskorenykh Street'],
];

const residentialCases = [
  ['ЖК Алексеевские Акварели', 'Oleksiivski Akvareli'],
  ['ЖК Олексіївські Акварелі', 'Oleksiivski Akvareli'],
  ['ЖК Научный', 'Nauchnyi'],
  ['ЖК Науковий', 'Nauchnyi'],
  ['ЖК 5 Авеню', '5th Avenue'],
  ['ЖК Металлист', 'Metalist'],
  ['ЖК Металіст', 'Metalist'],
  ['ЖК Венский дом', 'Videnskyi Dim'],
  ['ЖК Віденський дім', 'Videnskyi Dim'],
];

test('Kharkiv current street canonicals absorb Ukrainian, Russian and historical aliases', () => {
  for (const [input, canonical] of streetCases) {
    const match = matchDictionaryLocation(input, 'UA', 'Kharkiv');
    assert.equal(match?.type, 'streets', input);
    assert.equal(match?.name, canonical, input);
  }
});

test('Kharkiv residential aliases resolve to canonical complexes', () => {
  for (const [input, canonical] of residentialCases) {
    const match = matchDictionaryLocation(input, 'UA', 'Kharkiv');
    assert.equal(match?.type, 'residentialComplexes', input);
    assert.equal(match?.name, canonical, input);
  }
});
