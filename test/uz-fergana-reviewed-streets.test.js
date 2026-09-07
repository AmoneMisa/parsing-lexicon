import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'Кувасайская улица',
  'улица Конституции',
  'улица Нихол',
  'улица Белова',
  'улица Ворис',
  'улица Гулистон',
  'улица Бинафша',
  'улица Янги Хаёт',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Fergana');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Fergana streets are exposed as street owners', () => {
  const fergana = dictionaryFor('UZ', 'Fergana');
  for (const name of names) assert.ok(byName(fergana.streets, name), name);
});

test('reviewed Fergana street aliases resolve conservatively', () => {
  assertStreetMatch('Кувасайская ул.', 'Кувасайская улица');
  assertStreetMatch('ул. Конституции, дом 10', 'улица Конституции');
  assertStreetMatch('ул. Нихол', 'улица Нихол');
  assertStreetMatch('ул. Гулистон', 'улица Гулистон');
  assertStreetMatch('ул. Янги Хаёт', 'улица Янги Хаёт');

  const bareCity = matchDictionaryLocation('Фергана', 'UZ', 'Fergana');
  assert.notEqual(bareCity?.type, 'streets');

  for (const noise of ['улица Куркам', 'улица Машъал', 'Ферганский Государственный Унивеситет']) {
    const match = matchDictionaryLocation(noise, 'UZ', 'Fergana');
    assert.notEqual(match?.type, 'streets', noise);
  }
});
