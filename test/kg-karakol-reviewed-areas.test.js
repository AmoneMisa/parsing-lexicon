import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

function byName(group, name) {
  return (group || []).find((entry) => entry.name === name);
}

test('reviewed Karakol areas are available through the runtime dictionary', () => {
  const karakol = dictionaryFor('KG', 'Karakol');
  assert.ok(karakol);

  assert.ok(byName(karakol.microdistricts, 'Кашка-Суу'));
  assert.ok(byName(karakol.microdistricts, 'Хан-Теңири'));
  assert.ok(byName(karakol.residentialComplexes, 'Karakol Residence'));

  assert.deepEqual(
    matchDictionaryLocation('квартира в микрорайоне Кашка-Суу', 'KG', 'Karakol'),
    {
      city: 'Karakol',
      type: 'microdistricts',
      name: 'Кашка-Суу',
      aliases: byName(karakol.microdistricts, 'Кашка-Суу').aliases,
    },
  );

  assert.deepEqual(
    matchDictionaryLocation('новостройка в микрорайоне Хан-Тенгри', 'KG', 'Karakol'),
    {
      city: 'Karakol',
      type: 'microdistricts',
      name: 'Хан-Теңири',
      aliases: byName(karakol.microdistricts, 'Хан-Теңири').aliases,
    },
  );

  assert.deepEqual(
    matchDictionaryLocation('квартира в ЖК Karakol Residence', 'KG', 'Karakol'),
    {
      city: 'Karakol',
      type: 'residentialComplexes',
      name: 'Karakol Residence',
      aliases: byName(karakol.residentialComplexes, 'Karakol Residence').aliases,
    },
  );

  assert.equal(byName(karakol.microdistricts, 'Стройка ГИК мкр. "Хан-Теңири"'), undefined);
});
