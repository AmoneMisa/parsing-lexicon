import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseHousingCardAmenities,
  parseHousingNearbyMentions,
  parseHousingNearbyShops,
  parseHousingQuarterLabel,
} from '../src/housing-card-fields.js';

test('parses the backend card quarter labels without location ownership', () => {
  assert.equal(parseHousingQuarterLabel('Chilonzor 12'), '12 kvartal');
  assert.equal(parseHousingQuarterLabel('Uchtepa 25-dahasi'), '25 kvartal');
  assert.equal(parseHousingQuarterLabel('13 kvartil'), '13 kvartal');
  assert.equal(parseHousingQuarterLabel('Glinka, квартира'), 'Glinka');
  assert.equal(parseHousingQuarterLabel('C-2, Tashkent'), 'C-2');
});

test('does not promote a nearby central block reference to the listing quarter', () => {
  assert.equal(parseHousingQuarterLabel('До Ц1 и ЖК Инфинити 5 мин на машине'), null);
  assert.equal(parseHousingQuarterLabel('Ориентир: Ц1'), null);
  assert.equal(parseHousingQuarterLabel('Ц1, квартира в центре'), 'C-1');
});

test('returns stable card labels for amenities without dedicated fields', () => {
  assert.deepEqual(
    parseHousingCardAmenities('Посудомоечная машина, раздельные комнаты, телевизор, постельное бельё'),
    ['Dishwasher', 'Separate rooms', 'Television', 'Bed linen'],
  );
});

test('extracts open-ended nearby mentions and named shops for card fields', () => {
  assert.deepEqual(
    parseHousingNearbyMentions('Ориентир: Дружба Народов\nРядом есть: парк Жовтневий, школа № 24'),
    ['Дружба Народов', 'парк Жовтневий', 'школа № 24'],
  );
  assert.deepEqual(parseHousingNearbyShops('Рядом Korzinka и High Town Mall, ТРЦ Compass'), [
    'Korzinka',
    'High Town Mall',
    'ТРЦ Compass',
  ]);
});

test('a housing class is not a nearby shop', () => {
  // The Klass chain shares its name with the bare word "класс", so every
  // "бизнес-класс" listing gained a shop it never mentioned - and downstream
  // that shop becomes a geocoding anchor.
  assert.deepEqual(parseHousingNearbyShops('ЖК «Mavera Town» — бизнес-класс'), []);
  assert.deepEqual(parseHousingNearbyShops('квартира эконом-класс'), []);
  assert.deepEqual(parseHousingNearbyShops('премиум-класс жильё'), []);
  assert.deepEqual(parseHousingNearbyShops('рядом магазин Класс'), ['Klass']);
  assert.deepEqual(parseHousingNearbyShops('Klass рядом'), ['Klass']);
});