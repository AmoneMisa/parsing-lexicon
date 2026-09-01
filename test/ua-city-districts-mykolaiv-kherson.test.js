import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES } from '../src/index.js';

const districtNames = (city) => (LOCATION_DICTIONARIES.UA?.[city]?.districts || []).map(({ name }) => name).sort();

function matchingDistrict(city, text) {
  return (LOCATION_DICTIONARIES.UA?.[city]?.districts || []).find((entry) => entry.re.test(text))?.name || null;
}

test('Mykolaiv and Kherson expose complete current district canonical sets', () => {
  assert.deepEqual(districtNames('Mykolaiv'), ['Inhulskyi', 'Korabelnyi', 'Tsentralnyi', 'Zavodskyi'].sort());
  assert.deepEqual(districtNames('Kherson'), ['Dniprovskyi', 'Korabelnyi', 'Tsentralnyi'].sort());
});

test('Mykolaiv current and historical district wording resolves to current canonicals', () => {
  assert.equal(matchingDistrict('Mykolaiv', 'Центральний район'), 'Tsentralnyi');
  assert.equal(matchingDistrict('Mykolaiv', 'Заводской район'), 'Zavodskyi');
  assert.equal(matchingDistrict('Mykolaiv', 'Інгульський район'), 'Inhulskyi');
  assert.equal(matchingDistrict('Mykolaiv', 'Ленинский район'), 'Inhulskyi');
  assert.equal(matchingDistrict('Mykolaiv', 'Корабельний район'), 'Korabelnyi');
});

test('Kherson historical district wording resolves without becoming a current canonical', () => {
  assert.equal(matchingDistrict('Kherson', 'Дніпровський район'), 'Dniprovskyi');
  assert.equal(matchingDistrict('Kherson', 'Корабельный район'), 'Korabelnyi');
  assert.equal(matchingDistrict('Kherson', 'Комсомольський район'), 'Korabelnyi');
  assert.equal(matchingDistrict('Kherson', 'Центральний район'), 'Tsentralnyi');
  assert.equal(matchingDistrict('Kherson', 'Суворовский район'), 'Tsentralnyi');
  assert.equal(districtNames('Kherson').includes('Suvorovskyi'), false);
  assert.equal(districtNames('Kherson').includes('Komsomolskyi'), false);
});
