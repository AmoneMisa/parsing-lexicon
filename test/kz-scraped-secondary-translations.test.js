import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

const residentialNames = (city) => new Set(
  (dictionaryFor('KZ', city)?.residentialComplexes || []).map(({ name }) => name),
);

test('secondary KZ scrape-backed residential canonicals are registered', () => {
  const shymkent = residentialNames('Shymkent');
  for (const name of ['Asar House III', 'Asar-City', 'Capital Residence', 'Sauran', 'Ұлы Шаңырақ']) {
    assert.ok(shymkent.has(name), `Shymkent should contain ${name}`);
  }

  const karaganda = residentialNames('Karaganda');
  for (const name of ['Central City', 'Dream House', 'Otbasy Village', 'Tulpar Residence', 'Новый Степной']) {
    assert.ok(karaganda.has(name), `Karaganda should contain ${name}`);
  }

  const aktobe = residentialNames('Aktobe');
  for (const name of ['Garden Residence', 'Grand Nomad', 'Арайлы', 'Жети казына', 'Сункар']) {
    assert.ok(aktobe.has(name), `Aktobe should contain ${name}`);
  }
});

test('secondary-city Russian, Kazakh and Latin aliases resolve to residential canonicals', () => {
  const cases = [
    ['Shymkent', 'ЖК Асар Хаус 3', 'Asar House III'],
    ['Shymkent', 'ЖК Көк-Жайлау', 'Кок-Жайлау'],
    ['Shymkent', 'ЖК Капитал Сити', 'Capital City'],
    ['Shymkent', 'ЖК Uly Shanyraq', 'Ұлы Шаңырақ'],
    ['Karaganda', 'ЖК Дрим Хаус', 'Dream House'],
    ['Karaganda', 'ЖК Гүлдер', 'Гулдер'],
    ['Karaganda', 'ЖК Tulpar Residence', 'Tulpar Residence'],
    ['Karaganda', 'ЖК Новый Степной', 'Новый Степной'],
    ['Aktobe', 'ЖК Жеті қазына', 'Жети казына'],
    ['Aktobe', 'ЖК Дәулет', 'Даулет'],
    ['Aktobe', 'ЖК Grand Nomad', 'Grand Nomad'],
    ['Aktobe', 'ЖК Сұңқар', 'Сункар'],
  ];

  for (const [city, text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', city);
    assert.equal(match?.type, 'residentialComplexes', `${city}: ${text}`);
    assert.equal(match?.name, expected, `${city}: ${text}`);
  }
});
