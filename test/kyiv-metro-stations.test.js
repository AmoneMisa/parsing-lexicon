import test from 'node:test';
import assert from 'node:assert/strict';

import { locationCities } from '../src/locations-runtime.js';
import { mergeLocationCountries } from '../src/location-merge.js';
import { UA_METRO_LOCATION_EXTENSIONS } from '../src/ua-location-extensions-metro.js';
import { matchFirstEntry } from '../src/alias-prefilter.js';

const kyiv = mergeLocationCountries(locationCities('UA'), UA_METRO_LOCATION_EXTENSIONS).Kyiv;
const station = (text) => matchFirstEntry(kyiv.metro, text)?.name ?? null;

test('Kyiv metro covers stations beyond the legacy dozen', () => {
  assert.equal(kyiv.metro.length, 45);
  assert.equal(station('метро «Контрактова площа»'), 'Kontraktova Ploshcha');
  assert.equal(station('Лук\'янівська'), 'Lukianivska');
  assert.equal(station('Лук’янівська'), 'Lukianivska');
  assert.equal(station('ст. Площадь Украинских Героев'), 'Ploshcha Ukrainskykh Heroiv');
  assert.equal(station('Золоті ворота'), 'Zoloti Vorota');
});

test('stations named like a city, district or street need the metro keyword', () => {
  for (const bare of ['біля Дніпра', 'набережна Дніпро', 'район Оболонь', 'Дарниця', 'Лісова вулиця', 'Нивки']) {
    assert.equal(station(bare), null, bare);
  }
  assert.equal(station('метро Оболонь'), 'Obolon');
  assert.equal(station('станція метро Дарниця'), 'Darnytsia');
  assert.equal(station('станция метро Днепр'), 'Dnipro');
});

test('street aliases do not carry the place a street is named after', () => {
  const streets = kyiv.streets;
  const lane = streets.find((entry) => entry.name === 'Подільський провулок');
  assert.ok(lane);
  assert.equal(matchFirstEntry(streets, 'Швидкий спуск на Поділ та Глибочицьку')?.name ?? null, null);
  assert.notEqual(matchFirstEntry(streets, 'історична місцевість Татарка')?.name, 'Татарська вулиця');
});
