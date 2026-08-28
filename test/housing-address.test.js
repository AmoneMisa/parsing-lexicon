import test from 'node:test';
import assert from 'node:assert/strict';
import { composeHousingAddress, parseHousingAddress } from '../src/housing-address.js';

test('parses explicit Ukrainian street, house and building', () => {
  assert.deepEqual(parseHousingAddress('вул. Воробкевича 12, корпус 2'), {
    address: 'Воробкевича 12 корп. 2',
    street: 'Воробкевича',
    houseNumber: '12',
    building: '2',
    confidence: 1,
  });
});

test('parses Ukrainian postfix street type and ignores preceding listing prose', () => {
  const parsed = parseHousingAddress('продаж квартири жк Alter ego 63m2 2к Лабораторний провулок 7');
  assert.equal(parsed.street, 'Лабораторний провулок');
  assert.equal(parsed.houseNumber, '7');
  assert.equal(parsed.address, 'Лабораторний провулок 7');
  assert.equal(parsed.confidence, 1);

  const fromDescription = parseHousingAddress('Продаж видової квартири в ЖК Alter Ego | Лабораторний провулок, 7\nУ продажу стильна квартира');
  assert.equal(fromDescription.street, 'Лабораторний провулок');
  assert.equal(fromDescription.houseNumber, '7');
  assert.equal(fromDescription.address, 'Лабораторний провулок 7');
});

test('parses abbreviated Ukrainian avenue before trailing ЖК context', () => {
  const parsed = parseHousingAddress(
    'Продам 1 кімн. квартиру на пр. Олександрівський, 69Д, ЖК Олександрівський, від забудовника Авантаж.',
  );
  assert.equal(parsed.street, 'Олександрівський');
  assert.equal(parsed.houseNumber, '69Д');
  assert.equal(parsed.address, 'Олександрівський 69Д');
  assert.equal(parsed.confidence, 1);
});

test('stops prefixed street address before following listing prose', () => {
  const parsed = parseHousingAddress('Сдам 1 комнатную квартиру улица львовская 1 /2х этажного дома ( дом переделан под квартиры, двор общий для квартирантов )');
  assert.equal(parsed.street, 'львовская');
  assert.equal(parsed.houseNumber, '1');
  assert.equal(parsed.address, 'львовская 1');
  assert.equal(parsed.confidence, 1);
});

test('parses labelled bare address without treating arbitrary prose as address', () => {
  const parsed = parseHousingAddress('Адрес: Воробкевича 12-А');
  assert.equal(parsed.street, 'Воробкевича');
  assert.equal(parsed.houseNumber, '12-А');
  assert.equal(parsed.address, 'Воробкевича 12-А');

  assert.deepEqual(parseHousingAddress('Цена 95000, телефон +998 90 123 45 67'), {
    address: null,
    street: null,
    houseNumber: null,
    building: null,
    confidence: 0,
  });
});

test('source address guard rejects floors districts stops and residential complexes', () => {
  for (const value of [
    'Перший поверх',
    'Район Цукровий',
    'Біля зупинки',
    'ЖК Олександрівський',
  ]) {
    assert.deepEqual(parseHousingAddress(value, { allowBare: true }), {
      address: null,
      street: null,
      houseNumber: null,
      building: null,
      confidence: 0,
    }, value);
  }
});

test('parses Uzbek and Romanian explicit address markers', () => {
  const uz = parseHousingAddress("Shota Rustaveli ko'chasi 58");
  assert.equal(uz.street, 'Shota Rustaveli');
  assert.equal(uz.houseNumber, '58');

  const ro = parseHousingAddress('Strada Lujerului 42, bloc 3');
  assert.equal(ro.street, 'Lujerului');
  assert.equal(ro.houseNumber, '42');
  assert.equal(ro.building, '3');
});

test('known canonical street extracts only an adjacent house number from prose', () => {
  const ua = parseHousingAddress('Світла квартира, Воробкевича 12, поруч парк', { knownStreet: 'Воробкевича' });
  assert.equal(ua.street, 'Воробкевича');
  assert.equal(ua.houseNumber, '12');
  assert.equal(ua.address, 'Воробкевича 12');

  const uz = parseHousingAddress("Toshkent, Shota Rustaveli ko'chasi 58, 3 xona", { knownStreet: 'Shota Rustaveli' });
  assert.equal(uz.street, 'Shota Rustaveli');
  assert.equal(uz.houseNumber, '58');

  const noAdjacentNumber = parseHousingAddress('Воробкевича, площа 68 м2, ціна 95000', { knownStreet: 'Воробкевича' });
  assert.equal(noAdjacentNumber.street, 'Воробкевича');
  assert.equal(noAdjacentNumber.houseNumber, null);
});

test('allowBare is reserved for source-provided address fields', () => {
  const parsed = parseHousingAddress('Воробкевича 12', { allowBare: true });
  assert.equal(parsed.street, 'Воробкевича');
  assert.equal(parsed.houseNumber, '12');
  assert.equal(parsed.confidence, 0.85);
});

test('allowDelimitedBare extracts street and house from city-scoped comma prose', () => {
  const parsed = parseHousingAddress(
    'Харьков, Киевский р-н, Метростроителей, 3, Северная Салтовка',
    { allowDelimitedBare: true },
  );
  assert.equal(parsed.street, 'Метростроителей');
  assert.equal(parsed.houseNumber, '3');
  assert.equal(parsed.address, 'Метростроителей 3');
});

test('composeHousingAddress produces a stable canonical query string', () => {
  assert.equal(composeHousingAddress({ street: 'Воробкевича', houseNumber: '12', building: '2' }), 'Воробкевича 12 корп. 2');
});
