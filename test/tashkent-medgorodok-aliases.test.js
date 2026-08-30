import test from 'node:test';
import assert from 'node:assert/strict';

import { TASHKENT_AREAS } from '../src/geo.js';
import { TASHKENT_AREA_ADDITIONS } from '../src/tashkent-colloquial.js';
import { matchTashkentHousingLandmarks } from '../src/tashkent-housing-geography.js';

const names = (value) => matchTashkentHousingLandmarks(value).map((entry) => entry.name);

test('TashMI-2 and New TashMI spellings resolve to Medgorodok', () => {
  for (const value of ['TashMI-2', 'ToshMI 2', 'ТашМИ-2', 'ТошМИ 2', 'Новый ТашМИ', 'Янги ТашМИ']) {
    assert.ok(names(`${value}, Ташкент`).includes('Medgorodok'), value);
  }
});

test('TashMI-2 is a Medgorodok alias and not a second canonical or Shifokorlar-2 alias', () => {
  const medgorodok = TASHKENT_AREAS.Almazar.find((entry) => entry.name === 'Medgorodok');
  const shifokorlar2 = TASHKENT_AREA_ADDITIONS.Almazar.find((entry) => entry.name === 'Shifokorlar-2');

  assert.ok(medgorodok?.aliases.includes('TashMI-2'));
  assert.equal(TASHKENT_AREAS.Almazar.some((entry) => entry.name === 'TashMI-2'), false);
  assert.equal(shifokorlar2?.aliases.includes('TashMI-2'), false);
});
