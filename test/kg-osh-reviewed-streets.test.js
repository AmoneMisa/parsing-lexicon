import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

function byName(group, name) {
  return (group || []).find((entry) => entry.name === name);
}

const reviewedStreetNames = Object.freeze([
  'Аскар Шакиров көчөсү',
  'Асранкулов көчөсү',
  'Иминов көчөсү',
  'Келечек көчөсү',
  'Улица Хан-Ордо',
  'Улица Кочконова Турдали',
  'Кулатов көчөсү',
  'Улица Курманжан датка',
  'Улица Мамырова',
  'Улица Монуева',
  'Улица Насирдинова',
  'Ошская улица',
  'Улица Раимбекова',
  'Саргалчаев көчөсү',
  'Ташмамата Джумабаева улица',
  'Тоголок Молдо көчөсү',
  'Төрөбек Абакир уулу көчөсү',
]);

test('reviewed Osh street identities are exposed exactly once', () => {
  const osh = dictionaryFor('KG', 'Osh');
  assert.ok(osh);

  for (const name of reviewedStreetNames) {
    const entry = byName(osh.streets, name);
    assert.ok(entry, name);
    assert.ok(entry.re.test(name), `${name} should match its source spelling`);
  }
});

test('Kulatov street remains distinct from the Kulatov microdistrict', () => {
  const street = matchDictionaryLocation('адрес: Кулатов көчөсү', 'KG', 'Osh');
  assert.ok(street);
  assert.equal(street.type, 'streets');
  assert.equal(street.name, 'Кулатов көчөсү');

  const microdistrict = matchDictionaryLocation('квартира в микрорайоне Кулатов', 'KG', 'Osh');
  assert.ok(microdistrict);
  assert.equal(microdistrict.type, 'microdistricts');
  assert.equal(microdistrict.name, 'Кулатов');
});

test('POIs misclassified by the scrape are not promoted as Osh streets', () => {
  const osh = dictionaryFor('KG', 'Osh');
  for (const name of [
    'Ошский филиал общественного объединения Союза художников Кыргызской респбулуки',
    'Ошский государственный университет',
    'Совет профсоюзов Ошской области',
    'Узбекский драматический театр им. З. М. Бабура',
  ]) {
    assert.equal(byName(osh.streets, name), undefined);
  }
});
