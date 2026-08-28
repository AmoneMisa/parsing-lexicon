import test from 'node:test';
import assert from 'node:assert/strict';

import { TASHKENT_AREAS } from '../src/geo.js';
import { TASHKENT_AREA_ADDITIONS, FULL_TASHKENT_AREAS } from '../src/tashkent-colloquial.js';
import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';
import {
  hasExplicitTashkentDistrict,
  hasTashkentAreaAlias,
  matchTashkentHousingDistrict,
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

test('keeps Glinka as a street-scale landmark instead of inventing an area', () => {
  const entry = matchTashkentHousingLandmarks('Ориентир Глинка ГАИ')[0];
  assert.equal(entry?.name, 'Glinka');
  assert.equal(entry?.category, 'landmark');
  assert.equal(Object.values(TASHKENT_AREAS).flat().some((item) => item.name === 'Glinka'), false);
  assert.equal(Object.values(FULL_TASHKENT_AREAS).flat().some((item) => item.name === 'Glinka'), false);
});

test('classifies verified residential massifs as microdistrict semantics', () => {
  const yangiChoshtepa = matchTashkentHousingLandmarks('Сергели, ЯНГИ ЧОШТЕПА, квартира бор')[0];
  assert.equal(yangiChoshtepa?.name, 'Yangi Choshtepa');
  assert.equal(yangiChoshtepa?.category, 'microdistrict');

  const areas = Object.values(TASHKENT_AREAS).flat();
  for (const name of [
    'Sebzar', 'Olympia',
    'Karasu-1', 'Karasu-2', 'Karasu-3', 'Karasu-4', 'Karasu-6',
    'TTZ-1', 'TTZ-2', 'TTZ-3', 'TTZ-4',
    'Dustlik-1', 'Dustlik-2', 'Yangi Choshtepa', 'Sputnik', 'Tashselmash',
  ]) {
    assert.equal(areas.find((item) => item.name === name)?.type, 'microdistrict', name);
  }
  assert.equal(areas.some((item) => item.name === 'Sergeli Car Bazaar'), false);
});

test('colloquial additions do not create second canonical owners', () => {
  for (const [district, additions] of Object.entries(TASHKENT_AREA_ADDITIONS)) {
    const coreNames = new Set((TASHKENT_AREAS[district] || []).map((item) => item.name));
    for (const item of additions) {
      assert.equal(item.canonical, item.name);
      assert.equal(item.country, 'UZ');
      assert.equal(item.city, 'Tashkent');
      assert.ok(['local_area', 'microdistrict'].includes(item.type));
      assert.equal(coreNames.has(item.name), false, `${district}: duplicate ${item.name}`);
    }
  }
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
  assert.deepEqual(matchTashkentNumberedArea('Chilonzor 10 mavze', 'Chilanzar'), { number: 10, suffix: '' });
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

test('housing geography separates metro, district and massif contexts', () => {
  assert.equal(matchTashkentHousingMetro('метро Олмазор')?.name, 'Olmazor');
  assert.equal(matchTashkentHousingDistrict('метро Олмазор'), null);
  assert.equal(matchTashkentHousingDistrict('Алмазарский район')?.name, 'Almazar');
  assert.equal(matchTashkentHousingMetro('Алмазарский район'), null);

  assert.equal(matchTashkentHousingMetro('Сергели 5A массив'), null);
  assert.equal(matchTashkentHousingDistrict('Сергели 5A массив'), null);
  assert.equal(matchTashkentHousingMetro('метро Сергели')?.name, 'Sergeli');
  assert.equal(matchTashkentHousingDistrict('Сергелийский район')?.name, 'Sergeli');
});

test('keeps canonical Kuylyuk massif separate from the Qoyliq metro station', () => {
  const unnumbered = matchCentralAsiaLocationEntities('Куйлюк массив', 'UZ', 'Tashkent');
  const numbered = matchCentralAsiaLocationEntities('Сдам 2 ком квартиру куйлюк 5 массив', 'UZ', 'Tashkent');
  assert.ok(unnumbered.matches.some((entry) => entry.type === 'microdistrict' && entry.name === 'Kuylyuk'));
  assert.ok(numbered.matches.some((entry) => entry.type === 'microdistrict' && entry.name === 'Kuylyuk'));
  assert.equal(unnumbered.matches.some((entry) => entry.type === 'metro'), false);
  assert.equal(numbered.matches.some((entry) => entry.type === 'metro'), false);
  assert.equal(matchTashkentHousingMetro('Куйлюк массив'), null);
  assert.equal(matchTashkentHousingMetro('Куйлюк 5 массив'), null);
  assert.equal(matchTashkentHousingMetro('метро Куйлюк')?.name, 'Qoyliq');
});

test('explicit Minor context chooses one semantic type', () => {
  const metro = matchCentralAsiaLocationEntities('метро Минор, Ташкент', 'UZ', 'Tashkent');
  assert.ok(metro.matches.some((entry) => entry.type === 'metro' && entry.name === 'Minor'));
  assert.equal(metro.matches.some((entry) => entry.type === 'mahalla' && entry.name === 'Minor'), false);

  const mahalla = matchCentralAsiaLocationEntities('Минор махалла, Ташкент', 'UZ', 'Tashkent');
  assert.ok(mahalla.matches.some((entry) => entry.type === 'mahalla' && entry.name === 'Minor'));
  assert.equal(mahalla.matches.some((entry) => entry.type === 'metro' && entry.name === 'Minor'), false);
});

test('longer POI phrase suppresses a shorter homonymous geography token', () => {
  const market = matchCentralAsiaLocationEntities('Сергелийский авторынок, Ташкент', 'UZ', 'Tashkent');
  assert.ok(market.matches.some((entry) => entry.type === 'poi' && entry.name === 'Sergeli Car Bazaar'));
  assert.equal(market.matches.some((entry) => entry.type === 'metro' && entry.name === 'Sergeli'), false);
  assert.equal(market.matches.some((entry) => entry.type === 'microdistrict' && entry.name === 'Sergeli'), false);
  assert.equal(market.matches.some((entry) => entry.type === 'district' && entry.name === 'Sergeli'), false);
});

test('matches Qorasuv massif through the canonical Tashkent location registry', () => {
  const result = matchCentralAsiaLocationEntities('Корасув Массиви, 81-мактаб атрофида', 'UZ', 'Tashkent');
  assert.ok(result.matches.some((entry) => entry.type === 'microdistrict' && entry.name === 'Qorasuv'));
});

test('Tashkent City is a development area, not a residential complex', () => {
  const result = matchCentralAsiaLocationEntities('Tashkent City international business center', 'UZ', 'Tashkent');
  assert.ok(result.matches.some((entry) => entry.type === 'development_area' && entry.name === 'Tashkent City'));
  assert.equal(result.matches.some((entry) => entry.type === 'residential_complex' && entry.name === 'Tashkent City'), false);
});

test('centralizes the historical housing label for Tashkent north railway station', () => {
  assert.equal(
    matchTashkentHousingTransit('До метро Ташкент Северный вокзал 5 минут')?.name,
    'Tashkent North Railway Station',
  );
});
