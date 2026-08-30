import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations.js';

const QUARTERS = Object.freeze([
  '2 quarter','3 quarter','5 quarter','6 quarter','7 quarter','8 quarter','9 quarter','10 quarter','11 quarter','32 quarter',
  '2/2 quarter','2/5 quarter','3/2 quarter','3/3 quarter','4/5 quarter','4/6 quarter','5/1A quarter','5/1B quarter','5/3 quarter','5/4 quarter','5/5 quarter','6/4 quarter','18/19 quarter',
]);

const FORMS = new Map([
  ['2-daha', '2 quarter'],
  ['2-й квартал', '2 quarter'],
  ['5/1A dahasi', '5/1A quarter'],
  ['5/1A квартал', '5/1A quarter'],
  ['3/3-daha', '3/3 quarter'],
  ['3/3 квартал', '3/3 quarter'],
  ['18/19 dahasi', '18/19 quarter'],
  ['18/19 квартал', '18/19 quarter'],
]);

test('Angren uses verified quarter canonicals instead of guessed numbered microdistricts', () => {
  const city = LOCATION_DICTIONARIES.UZ.Angren;
  const canonicals = new Set(city.microdistricts.map(({ name }) => name));

  for (const canonical of QUARTERS) assert.ok(canonicals.has(canonical), canonical);
  for (const canonical of ['1 microdistrict','2 microdistrict','3 microdistrict','4 microdistrict','5 microdistrict']) {
    assert.equal(canonicals.has(canonical), false, canonical);
  }
});

test('Angren Uzbek and Russian quarter forms resolve to stable canonicals', () => {
  for (const [input, canonical] of FORMS) {
    const match = matchDictionaryLocation(input, 'UZ', 'Angren');
    assert.equal(match?.type, 'microdistricts', input);
    assert.equal(match?.name, canonical, input);
  }
});

test('Angren Geolog is a mahalla and street translations resolve', () => {
  const geolog = matchDictionaryLocation('Geolog mahallasi', 'UZ', 'Angren');
  assert.equal(geolog?.type, 'mahallas');
  assert.equal(geolog?.name, 'Geolog');

  const streets = new Map([
    ["Amir Temur ko'chasi", 'Amir Temur Street'],
    ['улица Амира Темура', 'Amir Temur Street'],
    ["Bunyodkor ko'chasi", 'Bunyodkor Street'],
    ['Бунёдкор кўчаси', 'Bunyodkor Street'],
    ["Ohangaron ko'chasi", 'Ohangaron Street'],
    ['улица Ахангаран', 'Ohangaron Street'],
  ]);

  for (const [input, canonical] of streets) {
    const match = matchDictionaryLocation(input, 'UZ', 'Angren');
    assert.equal(match?.type, 'streets', input);
    assert.equal(match?.name, canonical, input);
  }
});
