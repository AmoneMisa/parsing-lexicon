import test from 'node:test';
import assert from 'node:assert/strict';

import { geographyDisplayName } from '../src/geography-display.js';

test('Russian geography display names cover canonical Tashkent hierarchy', () => {
  assert.equal(geographyDisplayName('Tashkent', 'ru', 'city'), 'Ташкент');
  assert.equal(geographyDisplayName('Yunusabad', 'ru', 'district'), 'Юнусабад');
  assert.equal(geographyDisplayName('Yunusabad-19', 'ru', 'microdistrict'), 'Юнусабад-19');
  assert.equal(geographyDisplayName('Chilanzar-10', 'ru', 'microdistrict'), 'Чиланзар-10');
  assert.equal(geographyDisplayName('Novza', 'ru', 'metro'), 'Новза');
});

test('Uzbek geography display names cover Tashkent city and administrative districts', () => {
  assert.equal(geographyDisplayName('Tashkent', 'uz', 'city'), 'Toshkent');
  assert.equal(geographyDisplayName('Chilanzar', 'uz', 'district'), 'Chilonzor');
  assert.equal(geographyDisplayName('Yunusabad', 'uz', 'district'), 'Yunusobod');
  assert.equal(geographyDisplayName('Almazar', 'uz', 'district'), 'Olmazor');
  assert.equal(geographyDisplayName('Shaykhantahur', 'uz', 'district'), 'Shayxontohur');
});

test('Russian display names cover geo-catalog named and numbered Tashkent microdistricts', () => {
  assert.equal(geographyDisplayName('Olympia', 'ru', 'microdistrict'), 'Олимпия');
  assert.equal(geographyDisplayName('Dustlik-2', 'ru', 'microdistrict'), 'Дустлик-2');
  assert.equal(geographyDisplayName('Karasu-3', 'ru', 'microdistrict'), 'Карасу-3');
  assert.equal(geographyDisplayName('Traktorsozlar-1', 'ru', 'microdistrict'), 'Тракторсозлар-1');
  assert.equal(geographyDisplayName('TTZ-3', 'ru', 'microdistrict'), 'ТТЗ-3');
  assert.equal(geographyDisplayName('Qiyot', 'ru', 'microdistrict'), 'Кият');
});

test('numbered microdistrict formatter does not invent English labels', () => {
  assert.equal(geographyDisplayName('Yunusabad-19', 'en', 'microdistrict'), 'Yunusabad-19');
  assert.equal(geographyDisplayName('Karasu-3', 'en', 'microdistrict'), 'Karasu-3');
});

test('city-scoped Tashkent local entities reuse multilingual canonical aliases for display', () => {
  const tashkent = { country: 'UZ', city: 'Tashkent' };

  assert.equal(
    geographyDisplayName('Amir Temur Avenue', 'ru', 'street', tashkent),
    'проспект Амира Темура',
  );
  assert.equal(
    geographyDisplayName('Amir Temur Avenue', 'uz', 'street', tashkent),
    'Amir Temur shoh ko‘chasi',
  );
  assert.equal(
    geographyDisplayName('Chorsu Bazaar', 'ru', 'poi', tashkent),
    'базар Чорсу',
  );
  assert.equal(
    geographyDisplayName('Chorsu Bazaar', 'uz', 'poi', tashkent),
    'Chorsu bozori',
  );
  assert.equal(
    geographyDisplayName('Suvsoz-1', 'ru', 'local_area', tashkent),
    'Сувсоз-1',
  );
  assert.equal(
    geographyDisplayName('Suvsoz-1', 'uz', 'local_area', tashkent),
    'Suvsoz-1 mavzesi',
  );
  assert.equal(
    geographyDisplayName('Ahmad Yugnakiy', 'ru', 'mahalla', tashkent),
    'Ахмад Югнаки',
  );
  assert.equal(
    geographyDisplayName('Ahmad Yugnakiy', 'uz', 'mahalla', tashkent),
    'Ahmad Yugnakiy mahallasi',
  );
  assert.equal(
    geographyDisplayName('Assalom Jomiy', 'ru', 'residential_complex', tashkent),
    'Ассалом Жомий',
  );
});

test('local display lookup remains city-scoped and never guesses without context', () => {
  assert.equal(geographyDisplayName('Chorsu Bazaar', 'ru', 'poi'), 'Chorsu Bazaar');
  assert.equal(
    geographyDisplayName('Chorsu Bazaar', 'ru', 'poi', { country: 'KZ', city: 'Almaty' }),
    'Chorsu Bazaar',
  );
});


test('Tashkent multilingual locality labels stay deterministic across semantic types', () => {
  const tashkent = { country: 'UZ', city: 'Tashkent' };

  assert.equal(geographyDisplayName("Qo'yliq-6", 'uz', 'local_area', tashkent), 'Qo‘yliq-6 mavzesi');
  assert.equal(geographyDisplayName("Qo'yliq-6", 'ru', 'local_area', tashkent), 'Куйлюк-6');
  assert.equal(geographyDisplayName('Qalqon', 'uz', 'mahalla', tashkent), 'Qalqon mahallasi');
  assert.equal(geographyDisplayName('Qalqon', 'uz', 'local_area', tashkent), 'Qalqon mavzesi');
  assert.equal(geographyDisplayName('Qalqon', 'ru', 'local_area', tashkent), 'массив Калкон');
  assert.equal(geographyDisplayName("Bog'bon", 'ru', 'mahalla', tashkent), 'Богбон');
  assert.equal(geographyDisplayName("Bog'bon", 'ru', 'local_area', tashkent), 'массив Богбон');
  assert.equal(geographyDisplayName('Guruchariq', 'ru', 'local_area', tashkent), 'массив Гуручарик');
  assert.equal(geographyDisplayName('Guruchariq', 'uz', 'local_area', tashkent), 'Guruchariq mavzesi');
  assert.equal(geographyDisplayName('Beruniy-B1', 'uz', 'local_area', tashkent), 'Beruniy-B1 mavzesi');
  assert.equal(geographyDisplayName('Parkent-Riyoziy', 'ru', 'local_area', tashkent), 'Паркент-Риёзий');
  assert.equal(geographyDisplayName('Parkent-Siolkovskiy', 'ru', 'local_area', tashkent), 'Паркент-Сиолковский');
});
