import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';
import { parseHousingAddress } from '../src/housing-address.js';

const cases = [
  ['проспект Льва Ландау 2Б/1', 'Lva Landau Avenue', 'Льва Ландау', '2Б/1'],
  ['вул. Амосова 26А', 'Amosova Street', 'Амосова', '26А'],
  ['вулиця Гвардійців-Широнінців 22/1', 'Hvardiitsiv-Shyronintsiv Street', 'Гвардійців-Широнінців', '22/1'],
  ['проспект Ювілейний 40А', 'Yuvileinyi Avenue', 'Ювілейний', '40А'],
  ['проспект Юбилейный 82А', 'Yuvileinyi Avenue', 'Юбилейный', '82А'],
];

test('Kharkiv verified address forms preserve fractional and lettered house numbers', () => {
  for (const [text, canonicalStreet, street, houseNumber] of cases) {
    const location = matchDictionaryLocation(text, 'UA', 'Kharkiv');
    assert.equal(location?.type, 'streets', text);
    assert.equal(location?.name, canonicalStreet, text);

    const address = parseHousingAddress(text);
    assert.equal(address.street, street, text);
    assert.equal(address.houseNumber, houseNumber, text);
    assert.equal(address.confidence, 1, text);
  }
});

test('historical Kharkiv street address still maps to the current canonical street', () => {
  const text = 'проспект Гагарина 177';
  const location = matchDictionaryLocation(text, 'UA', 'Kharkiv');
  assert.equal(location?.type, 'streets');
  assert.equal(location?.name, 'Aerokosmichnyi Avenue');

  const address = parseHousingAddress(text);
  assert.equal(address.street, 'Гагарина');
  assert.equal(address.houseNumber, '177');
});
