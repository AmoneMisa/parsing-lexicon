import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHousingAmenities, parseHousingAreaFromText, parseHousingFloorFromText } from '../src/housing-text.js';

test('housing text area parser preserves legacy free-text forms', () => {
  assert.equal(parseHousingAreaFromText('Площадь 80 квадратов'), 80);
  assert.equal(parseHousingAreaFromText('2/5/16 56кв'), 56);
  assert.equal(parseHousingAreaFromText('Chilonzor 16кв'), null);
});

test('housing text floor parser preserves compact and labelled forms', () => {
  assert.deepEqual(parseHousingFloorFromText('2/5/16'), { floor: 5, totalFloors: 16 });
  assert.deepEqual(parseHousingFloorFromText('2³/4/4'), { floor: 4, totalFloors: 4 });
  assert.deepEqual(parseHousingFloorFromText('2-qavat / 14-qavatli'), { floor: 2, totalFloors: 14 });
  assert.deepEqual(parseHousingFloorFromText('на 5-м этаже, этажность: 9'), { floor: 5, totalFloors: 9 });
  assert.deepEqual(parseHousingFloorFromText('1/0/-1 этаж подвал'), { floor: -1, totalFloors: null });
  assert.deepEqual(parseHousingFloorFromText('16 этажлик дом, 13-этаж'), { floor: 13, totalFloors: 16 });
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
