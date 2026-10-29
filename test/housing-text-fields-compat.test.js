import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHousingRoomCount } from '../src/housing-structured.js';
import {
  parseDepositMonths,
  parseHousingAmenities,
  parseHousingAreaFromText,
  parseHousingEuroRooms,
  parseHousingFloorFromText,
  parseHousingResidentialComplex,
  parseHousingRoomsFromText,
} from '../src/housing-text.js';

test('housing text area parser preserves legacy free-text forms', () => {
  assert.equal(parseHousingAreaFromText('Площадь 80 квадратов'), 80);
  assert.equal(parseHousingAreaFromText('2/5/16 56кв'), 56);
  assert.equal(parseHousingAreaFromText('Chilonzor 16кв'), null);
});

test('euro layouts have one room fewer than their name, a studio has none, plain slang counts as written', () => {
  assert.equal(parseHousingEuroRooms('Евродвушка 40 м2'), 1);
  assert.equal(parseHousingEuroRooms('евротрёшка'), 2);
  assert.equal(parseHousingEuroRooms('евро-3'), 2);
  assert.equal(parseHousingEuroRooms('двушка'), null);
  assert.equal(parseHousingRoomsFromText('Евро-двушка'), 1);
  assert.equal(parseHousingRoomsFromText('Продам трёшку'), 3);
  assert.equal(parseHousingRoomsFromText('Студия 25 м2'), null);
  assert.equal(parseHousingRoomCount('евродвушка'), 1);
  assert.equal(parseHousingRoomCount('Евротрёшка'), 2);
  assert.equal(parseHousingRoomCount('студия'), null);
});

test('floor and floors written with a Ukrainian "з", an abbreviation, or Bulgarian spelling', () => {
  assert.deepEqual(parseHousingFloorFromText('Поверх — 6 з 9'), { floor: 6, totalFloors: 9 });
  assert.deepEqual(parseHousingFloorFromText('Поверх: 29 з 30'), { floor: 29, totalFloors: 30 });
  assert.deepEqual(parseHousingFloorFromText('2-ком 3эт/5эт'), { floor: 3, totalFloors: 5 });
  assert.deepEqual(parseHousingFloorFromText('етаж 3 из 5'), { floor: 3, totalFloors: 5 });
  assert.deepEqual(parseHousingFloorFromText('5 з 9 років'), { floor: null, totalFloors: null });
});

test('Romanian and Ukrainian forms of area and floors', () => {
  assert.equal(parseHousingAreaFromText('suprafața de 34,80 mp'), 34.8);
  assert.equal(parseHousingAreaFromText('70 mp'), 70);
  assert.equal(parseHousingAreaFromText('46 m 2'), 46);
  assert.equal(parseHousingAreaFromText('mp3 player 5'), null, '"mp" is a unit only on its own');
  assert.deepEqual(parseHousingFloorFromText('situat la etajul 6 din 8'), { floor: 6, totalFloors: 8 });
  assert.deepEqual(parseHousingFloorFromText('Etaj 3 din 4'), { floor: 3, totalFloors: 4 });
  assert.deepEqual(parseHousingFloorFromText('Этаж: 6 Этажность дома: 10'), { floor: 6, totalFloors: 10 });
  assert.deepEqual(parseHousingFloorFromText('розташована на 13 поверсі 21 поверхового будинку'), { floor: 13, totalFloors: 21 });
});

test('housing text floor parser preserves compact and labelled forms', () => {
  assert.deepEqual(parseHousingFloorFromText('2/5/16'), { floor: 5, totalFloors: 16 });
  assert.deepEqual(parseHousingFloorFromText('• Этаж - 3\n• Этажность - 9'), { floor: 3, totalFloors: 9 }, 'a dash after the label, as in a structured post');
  assert.deepEqual(parseHousingFloorFromText('2³/4/4'), { floor: 4, totalFloors: 4 });
  assert.deepEqual(parseHousingFloorFromText('2-qavat / 14-qavatli'), { floor: 2, totalFloors: 14 });
  assert.deepEqual(parseHousingFloorFromText('на 5-м этаже, этажность: 9'), { floor: 5, totalFloors: 9 });
  assert.deepEqual(parseHousingFloorFromText('1/0/-1 этаж подвал'), { floor: -1, totalFloors: null });
  assert.deepEqual(parseHousingFloorFromText('16 этажлик дом, 13-этаж'), { floor: 13, totalFloors: 16 });
  assert.deepEqual(parseHousingFloorFromText('4- каватда квартира ижарага'), { floor: 4, totalFloors: null });
});

test('housing text floor parser does not mistake a building storey count for a unit floor', () => {
  // "8 qavatli uy" states the building has 8 storeys; it says nothing about
  // which floor the advertised unit is on.
  assert.deepEqual(parseHousingFloorFromText('8 qavatli uy sotiladi'), { floor: null, totalFloors: 8 });
  assert.deepEqual(parseHousingFloorFromText('16 этажлик дом'), { floor: null, totalFloors: 16 });
});

test('housing text amenities cover mixed Uzbek/Russian listing vocabulary', () => {
  const text = `splani, shkaf, mebel va oshxona jihozlari; televizor, muzlatgich, konditsioner, wefi; kir yuvish mashinasi (Samsung aftomat). yashash uchun barcha jihozlari bor.`;
  assert.deepEqual(parseHousingAmenities(text), [
    'bed',
    'washingMachine',
    'refrigerator',
    'television',
    'airConditioner',
    'internet',
    'wardrobe',
    'furniture',
    'kitchenEquipment',
    'moveInReady',
  ]);
});

test('housing text amenities cover common sale listing features', () => {
  const text = 'Пластиковые окна, электроплита, теплый пол. Свое бесплатное парковочное место!';
  assert.deepEqual(parseHousingAmenities(text), [
    'stove',
    'plasticWindows',
    'heatedFloor',
    'freeParking',
  ]);
});

test('residential complex extraction stops before a Ukrainian address clause', () => {
  assert.equal(
    parseHousingResidentialComplex('ЖК Крокус за адресою вул. Холодногірська, 18'),
    'Крокус',
  );
});

test('housing text parsers cover the supplied Cyrillic Uzbek room form', () => {
  assert.equal(parseHousingRoomsFromText('1- хоналик квартира'), 1);
  assert.equal(parseHousingRoomsFromText('2 хона'), 2);
});

test('housing text parsers cover the Dream House listing fields', () => {
  const text = 'ЖК Dream House 8 этаж из 10 2 комнаты полноценные 80 квадратов';
  assert.equal(parseHousingResidentialComplex(text), 'Dream House');
  assert.equal(parseHousingRoomsFromText(text), 2);
  assert.deepEqual(parseHousingFloorFromText(text), { floor: 8, totalFloors: 10 });
  assert.equal(parseHousingAreaFromText(text), 80);
});

test('deposit months: the count with its unit, in the languages listings use', () => {
  const cases = [
    ['2 месяца', 2], ['одного месяца', 1], ['в размере двух месяцев', 2], ['месячная оплата', 1], ['месячной арендной платы', 1],
    ['1 місяць', 1], ['півтора місяця', 1.5], ['три місяці', 3], ['1,5 месяца', 1.5],
    ['două luni', 2], ['o lună', 1], ['3 luni', 3],
    ['ikki oy', 2], ['1 oylik', 1], ['bir oy', 1],
    ['месяц', 1],
  ];
  for (const [text, months] of cases) assert.equal(parseDepositMonths(text), months, text);
  for (const text of ['', null, '300$', '2 дня', 'много месяцев', '24 месяца', 'через 2 года']) {
    assert.equal(parseDepositMonths(text), null, String(text));
  }
});
