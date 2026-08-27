import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHousingAreaFromText, parseHousingFloorFromText } from '../src/housing-text.js';

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
});
