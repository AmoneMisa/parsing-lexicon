import test from 'node:test';
import assert from 'node:assert/strict';

import { TASHKENT_AREAS } from '../src/geo.js';
import { TASHKENT_AREA_ADDITIONS } from '../src/tashkent-colloquial.js';
import { locationCities } from '../src/locations.js';
import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';

const names = (result, type) => result.matches
  .filter((entry) => entry.type === type)
  .map((entry) => entry.name);

test('Tashkent canonical dictionary does not expose unsupported generic massif shells', () => {
  const tashkent = locationCities('UZ').Tashkent;
  const microdistricts = new Set((tashkent.microdistricts || []).map((entry) => entry.name));
  const localAreas = new Map((tashkent.localAreas || []).map((entry) => [entry.name, entry]));

  for (const name of ['Sergeli', 'Yunusabad-20', 'Yunusabad-21', 'Yunusabad-22']) {
    assert.equal(microdistricts.has(name), false, name);
  }

  assert.equal(microdistricts.has('Yunusabad-5'), true);
  assert.equal(microdistricts.has('Sputnik'), true);
  assert.equal(localAreas.get('Qorasuv')?.parent, 'Mirzo Ulugbek');
  assert.equal(microdistricts.has('Qorasuv'), false);
});

test('Tashkent matcher preserves umbrella-area vs numbered-block semantics', () => {
  const qorasuv = matchCentralAsiaLocationEntities('Qorasuv dahasi, Toshkent', 'UZ', 'Tashkent');
  assert.ok(names(qorasuv, 'local_area').includes('Qorasuv'));
  assert.equal(names(qorasuv, 'microdistrict').includes('Qorasuv'), false);

  // Karasu-6 belongs to the typed legacy-area compatibility registry, not the
  // expanded city dictionary. The umbrella matcher must not swallow its token.
  const numbered = matchCentralAsiaLocationEntities('Qorasuv-6, Toshkent', 'UZ', 'Tashkent');
  assert.equal(names(numbered, 'local_area').includes('Qorasuv'), false);
  const karasu6 = TASHKENT_AREAS['Mirzo Ulugbek'].find((entry) => entry.name === 'Karasu-6');
  assert.equal(karasu6?.type, 'microdistrict');

  const sputnik = matchCentralAsiaLocationEntities('Sputnik massivi, Toshkent', 'UZ', 'Tashkent');
  assert.ok(names(sputnik, 'microdistrict').includes('Sputnik'));
});

test('Tashkent current mavze and daha names are canonical local areas', () => {
  const tashkent = locationCities('UZ').Tashkent;
  const localAreas = new Map((tashkent.localAreas || []).map((entry) => [entry.name, entry]));

  for (const [name, parent] of [
    ['Suvsoz-1', 'Bektemir'],
    ['Suvsoz-5', 'Bektemir'],
    ["Bo'z-2", 'Mirzo Ulugbek'],
    ['Ahmad Yugnakiy', 'Mirzo Ulugbek'],
    ['Humoyun', 'Mirzo Ulugbek'],
    ['Feruza', 'Mirzo Ulugbek'],
    ['Quruvchi', 'Sergeli'],
    ["Bog'ko'cha", 'Shaykhantahur'],
    ['Gulobod', 'Shaykhantahur'],
    ["Beshqo'rg'on-4", 'Almazar'],
    ["Qo'yliq-4", 'Mirobod'],
    ["Qo'yliq-7", 'Sergeli'],
    ['Parkent-Riyoziy', 'Yashnobod'],
    ['Parkent-Siolkovskiy', 'Yashnobod'],
    ['Qalqon', 'Yashnobod'],
    ["Bog'bon", 'Yashnobod'],
    ['Aviasozlar-4', 'Yashnobod'],
    ['Minora', 'Almazar'],
    ['Guruchariq', 'Almazar'],
    ['Muxbir', 'Almazar'],
    ['Chuqursoy', 'Almazar'],
    ['Shimoliy Olmazor-2', 'Almazar'],
    ['Taraqqiyot-4', 'Almazar'],
    ['Shifokorlar-6', 'Almazar'],
    ['Beruniy-B3', 'Almazar'],
    ["Chamanbog'", 'Almazar'],
    ['Irrigator', 'Mirzo Ulugbek'],
    ['Parkent', 'Mirzo Ulugbek'],
    ['Markaz-12', 'Shaykhantahur'],
    ["So'lim", 'Yashnobod'],
    ['Asalobod-2', 'Yashnobod'],
    ['ToshGRES', 'Yunusabad'],
    ["Sug'diyona", 'Sergeli'],
  ]) {
    assert.equal(localAreas.get(name)?.parent, parent, name);
    assert.equal(localAreas.get(name)?.type, 'local_area', name);
  }
});

test('Tashkent matcher resolves historical and housing locality aliases', () => {
  const cases = [
    ['Водник 1 массив, Ташкент', 'Suvsoz-1'],
    ['Солнечный массив, Ташкент', 'Ahmad Yugnakiy'],
    ['Ясный массив, Ташкент', 'Humoyun'],
    ['Северо-Восток массив, Ташкент', 'Feruza'],
    ['Ц-27 массив, Ташкент', "Bog'ko'cha"],
    ['Ц-26 массив, Ташкент', 'Gulobod'],
    ['Куйлюк 6 массив, Ташкент', "Qo'yliq-6"],
    ['Мавлоно Риёзи массив, Ташкент', 'Parkent-Riyoziy'],
    ['Harbiylar-58a mavzesi, Toshkent', 'Qalqon'],
    ['Normuhammedov mavzesi, Toshkent', "Bog'bon"],
    ['Лисунова 1а массив, Ташкент', 'Aviasozlar-2'],
    ['Академгородок, Ташкент', 'Akademgorodok'],
    ['Ц-7, Ташкент', 'C-7'],
    ['С-22 массив, Ташкент', 'Guruchariq'],
    ['Лабзак Ц12, Ташкент', 'Markaz-12'],
    ['массив Ирригатор, Ташкент', 'Irrigator'],
    ['Asalabad-2 mavzesi, Toshkent', 'Asalobod-2'],
    ['ТашГРЭС массив, Ташкент', 'ToshGRES'],
    ['Согдиана массив, Ташкент', "Sug'diyona"],
  ];

  for (const [text, expected] of cases) {
    const result = matchCentralAsiaLocationEntities(text, 'UZ', 'Tashkent');
    assert.ok(names(result, 'local_area').includes(expected), `${text} -> ${expected}`);
  }
});

test('same-name mahalla and mavze stay distinct under explicit context', () => {
  for (const canonical of ['Qalqon', "Chamanbog'", "Sug'diyona"]) {
    const mahalla = matchCentralAsiaLocationEntities(`${canonical} mahallasi, Toshkent`, 'UZ', 'Tashkent');
    assert.ok(names(mahalla, 'mahalla').includes(canonical), canonical);
    assert.equal(names(mahalla, 'local_area').includes(canonical), false, canonical);

    const mavze = matchCentralAsiaLocationEntities(`${canonical} mavzesi, Toshkent`, 'UZ', 'Tashkent');
    assert.ok(names(mavze, 'local_area').includes(canonical), canonical);
    assert.equal(names(mavze, 'mahalla').includes(canonical), false, canonical);
  }
});

test('Riyoziy compatibility area follows its current Yashnobod parent', () => {
  assert.equal(TASHKENT_AREA_ADDITIONS['Mirzo Ulugbek'].some((entry) => entry.name === 'Riyoziy'), false);
  assert.equal(TASHKENT_AREA_ADDITIONS.Yashnobod.some((entry) => entry.name === 'Riyoziy'), true);
});
