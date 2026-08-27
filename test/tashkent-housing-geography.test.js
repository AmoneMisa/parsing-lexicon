import test from 'node:test';
import assert from 'node:assert/strict';

import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';
import {
  hasExplicitTashkentDistrict,
  hasTashkentAreaAlias,
  matchTashkentHousingLandmarks,
  matchTashkentHousingMetro,
  matchTashkentHousingTransit,
  matchTashkentNumberedArea,
} from '../src/tashkent-housing-geography.js';

const names = (value) => matchTashkentHousingLandmarks(value).map((entry) => entry.name);

test('covers Alay and C-2 housing aliases without consumer-local regexes', () => {
  assert.deepEqual(names('#4комнатная #Ц2 #Алайский #Центр'), ['Alay Bazaar', 'C-2']);
});

test('covers Darkhan and Novomoskovskaya as two independent housing landmarks', () => {
  assert.deepEqual(
    names('Ориентир: Дархан, Новомосковская.'),
    ['Darkhan', 'Novomoskovskaya'],
  );
});

test('covers Sergeli car bazaar transliteration typos', () => {
  assert.deepEqual(names('mo‘ljal Sergele moshina bozor'), ['Sergeli Car Bazaar']);
  assert.deepEqual(names('Sergile moshena bozor yonida'), ['Sergeli Car Bazaar']);
});

test('covers Yangi Choshtepa listing landmark', () => {
  assert.deepEqual(names('Сергели, ЯНГИ ЧОШТЕПА, квартира бор'), ['Yangi Choshtepa']);
});

test('covers Nizami and World Languages university shorthand with context', () => {
  const value = 'Nizomiy yoki Jahon tillar universitetida o‘qiydigan qizla.';
  assert.deepEqual(names(value), ['Nizami Pedagogical University', 'World Languages University']);
  assert.deepEqual(names('Nizomiy ko‘chasi'), []);
});

test('keeps official World Languages University names as aliases', () => {
  assert.deepEqual(
    names('Uzbekistan State World Languages University talabasi'),
    ['World Languages University'],
  );
});

test('centralizes numbered massif aliases and typo variants', () => {
  assert.deepEqual(matchTashkentNumberedArea('Sergele 5A kvartal', 'Sergeli'), { number: 5, suffix: 'a' });
  assert.deepEqual(matchTashkentNumberedArea('12 квартал Чиланзара', 'Chilanzar'), { number: 12, suffix: '' });
  assert.deepEqual(matchTashkentNumberedArea('Yunusobod 2 kvartal', 'Yunusabad'), { number: 2, suffix: '' });
  assert.deepEqual(matchTashkentNumberedArea('Куйлюк 5 массив', 'Kuylyuk'), { number: 5, suffix: '' });
  assert.equal(hasTashkentAreaAlias('квартира Сергели рядом с рынком', 'Sergeli'), true);
  assert.equal(hasExplicitTashkentDistrict('Sergele tumani, kvartira ijaraga', 'Sergeli'), true);
  assert.equal(hasExplicitTashkentDistrict('Чиланзарский район', 'Chilanzar'), true);
  // "туманность" (an unrelated word) must not be mistaken for "туман"
  // (district) plus a case ending.
  assert.equal(hasExplicitTashkentDistrict('Сергели туманность видна ночью', 'Sergeli'), false);
});

test('centralizes Sergeli metro typo aliases', () => {
  assert.equal(matchTashkentHousingMetro('sergele')?.name, 'Sergeli');
  assert.equal(matchTashkentHousingMetro('sergile')?.name, 'Sergeli');
  assert.equal(matchTashkentHousingMetro('Сергели')?.name, 'Sergeli');
});

test('keeps canonical Kuylyuk massif separate from the Qoyliq metro station', () => {
  const unnumbered = matchCentralAsiaLocationEntities('Куйлюк массив', 'UZ', 'Tashkent');
  const numbered = matchCentralAsiaLocationEntities('Сдам 2 ком квартиру куйлюк 5 массив', 'UZ', 'Tashkent');
  assert.ok(unnumbered.matches.some((entry) => entry.type === 'microdistrict' && entry.name === 'Kuylyuk'));
  assert.ok(numbered.matches.some((entry) => entry.type === 'microdistrict' && entry.name === 'Kuylyuk'));
  assert.equal(matchTashkentHousingMetro('Куйлюк массив'), null);
  assert.equal(matchTashkentHousingMetro('Куйлюк 5 массив'), null);
  assert.equal(matchTashkentHousingMetro('метро Куйлюк')?.name, 'Qoyliq');
});

test('centralizes the historical housing label for Tashkent north railway station', () => {
  assert.equal(
    matchTashkentHousingTransit('До метро Ташкент Северный вокзал 5 минут')?.name,
    'Tashkent North Railway Station',
  );
});
