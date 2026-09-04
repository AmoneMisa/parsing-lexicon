import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

const cases = [
  ['проспект Мира', 'Chyngyz Aytmatov Avenue'],
  ['проспект Чынгыза Айтматова', 'Chyngyz Aytmatov Avenue'],
  ['Aaly Tokombaev Street', 'Aaly Tokombayev Avenue'],
  ['улица Аалы Токомбаева', 'Aaly Tokombayev Avenue'],
  ['проспект Манаса', 'Manas Avenue'],
  ['Чүй проспекти', 'Chui Avenue'],
  ['улица Байтик-Баатыра', 'Baitik Baatyr Street'],
  ['ул. Исанова', 'Nasirdin Isanov Street'],
  ['улица Ибраимова', 'Ibraimov Street'],
  ['Токтогул Сатылганов көчөсү', 'Toktogul Street'],
  ['улица Боконбаева', 'Joomart Bokonbayev Street'],
  ['улица Юсупа Абдрахманова', 'Jusup Abdrakhmanov Street'],
  ['улица Шопокова', 'Shopokov Street'],
  ['Zhibek Zholu Avenue', 'Jibek Jolu Avenue'],
  ['Усенбаев көчөсү', 'Usenbaev Street'],
  ['улица Юнусалиева', 'Yunusaliev Street'],
  ['Эркиндик бульвары', 'Erkindik Boulevard'],
  ['Московская улица', 'Moskovskaya Street'],
  ['улица Бакаева', 'Bakaev Street'],
  ['Жантөшев көчөсү', 'Jantoshev Street'],
  ['улица Сухэ-Батора', 'Sukhe Bator Street'],
  ['Павлов көчөсү', 'Pavlov Street'],
  ['улица Жукеева-Пудовкина', 'Zhukeev-Pudovkin Street'],
  ['улица Горького', 'Gorky Street'],
  ['Орозбеков көчөсү', 'Orozbekov Street'],
  ['Киевская улица', 'Kievskaya Street'],
  ['Панфилов көчөсү', 'Panfilov Street'],
  ['Тоголок Молдо көчөсү', 'Togolok Moldo Street'],
  ['улица Уметалиева', 'Umetaliev Street'],
  ['бульвар Молодой Гвардии', 'Molodaya Gvardiya Boulevard'],
];

test('Bishkek street aliases collapse onto one canonical identity', () => {
  for (const [input, canonical] of cases) {
    const match = matchDictionaryLocation(input, 'KG', 'Bishkek');
    assert.equal(match?.type, 'streets', input);
    assert.equal(match?.name, canonical, input);
  }
});
