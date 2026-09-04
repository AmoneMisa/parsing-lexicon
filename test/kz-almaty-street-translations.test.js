import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

const streetNames = () => new Set(
  (dictionaryFor('KZ', 'Almaty')?.streets || []).map(({ name }) => name),
);

test('remaining cleaned Almaty streets are registered once as canonicals', () => {
  const streets = streetNames();
  for (const name of [
    '15-я улица',
    'Алданская улица',
    'Жаркентская улица',
    'Улица Байсултанова',
    'Улица Жакибаева',
    'Улица Руханият',
    'Улица Теренозек',
    'Улица Юрия Кима',
  ]) {
    assert.ok(streets.has(name), `Almaty should contain ${name}`);
  }
});

test('remaining Almaty street spelling and translation aliases resolve', () => {
  const cases = [
    ['Aldanskaya Street 12', 'Алданская улица'],
    ['улица Молодёжная', 'Молодежная улица'],
    ['Байсұлтанов көшесі', 'Улица Байсултанова'],
    ['Жақыбаев көшесі', 'Улица Жакибаева'],
    ['Qausar Street', 'Улица Каусар'],
    ['Руханият көшесі', 'Улица Руханият'],
    ['Теренөзек көшесі', 'Улица Теренозек'],
    ['Yuri Kim Street', 'Улица Юрия Кима'],
  ];

  for (const [text, expected] of cases) {
    const match = matchDictionaryLocation(text, 'KZ', 'Almaty');
    assert.equal(match?.type, 'streets', text);
    assert.equal(match?.name, expected, text);
  }
});
