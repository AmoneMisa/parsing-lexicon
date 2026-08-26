import test from 'node:test';
import assert from 'node:assert/strict';

import {
  UA_CITY_COORDINATES,
  ukraineCityCoordinates,
  ukraineCityGeocodeCandidates,
  ukraineLocationCoordinates,
  ukraineLocationGeocodeCandidates,
  ukraineCoordinateFallback,
} from '@whiteslove/parsing-lexicon/ua-geo-coordinates';
import { canonicalUkraineCity } from '../src/ukraine.js';

test('Ukrainian city coordinates use canonical keys and the lat/lng contract', () => {
  assert.ok(Object.keys(UA_CITY_COORDINATES).length >= 80);
  for (const [city, coords] of Object.entries(UA_CITY_COORDINATES)) {
    assert.equal(canonicalUkraineCity(city), city, `non-canonical coordinate key: ${city}`);
    assert.deepEqual(Object.keys(coords).sort(), ['lat', 'lng']);
    assert.ok(Number.isFinite(coords.lat), `${city} lat must be finite`);
    assert.ok(Number.isFinite(coords.lng), `${city} lng must be finite`);
    assert.ok(coords.lat >= 44 && coords.lat <= 53, `${city} latitude outside Ukraine bounds`);
    assert.ok(coords.lng >= 21 && coords.lng <= 41, `${city} longitude outside Ukraine bounds`);
  }
});

test('historical city aliases resolve to the current canonical coordinate', () => {
  assert.deepEqual(ukraineCityCoordinates('Киев'), UA_CITY_COORDINATES.Kyiv);
  assert.deepEqual(ukraineCityCoordinates('Червоноград'), UA_CITY_COORDINATES.Sheptytskyi);
  assert.deepEqual(ukraineCityCoordinates('Новоград-Волынский'), UA_CITY_COORDINATES.Zviahel);
  assert.deepEqual(ukraineCityCoordinates('Мукачеве'), UA_CITY_COORDINATES.Mukachevo);
});

test('same-name ambiguous source places are not silently assigned to package cities', () => {
  assert.equal(ukraineCityCoordinates('Pivdenne'), null);
  assert.equal(ukraineCityCoordinates('Berezivka'), null);
  assert.deepEqual(ukraineCityGeocodeCandidates('Pivdenne'), ['Pivdenne, Ukraine']);
});

test('verified Odesa dependency anchors resolve through metropolitan aliases', () => {
  const expected = { lat: 46.5617, lng: 30.7961 };
  assert.deepEqual(ukraineLocationCoordinates('Одесса', 'suburb', 'Крижанівка'), expected);
  assert.deepEqual(ukraineLocationCoordinates('Odesa', 'suburb', 'Крыжановка'), expected);
  assert.deepEqual(ukraineCoordinateFallback('Одеса', 'suburb', 'Крыжановка'), {
    ...expected,
    accuracy: 'exact',
    source: 'location',
  });
});

test('unanchored dependencies produce geocode candidates and safely fall back to city centre', () => {
  const candidates = ukraineLocationGeocodeCandidates('Харьков', 'metro', 'Академика Павлова');
  assert.ok(candidates.includes('Akademika Pavlova, Kharkiv, Ukraine'));
  assert.deepEqual(ukraineCoordinateFallback('Харьков', 'metro', 'Академика Павлова'), {
    ...UA_CITY_COORDINATES.Kharkiv,
    accuracy: 'city',
    source: 'city',
  });
});
