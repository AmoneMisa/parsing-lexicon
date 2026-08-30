import test from 'node:test';
import assert from 'node:assert/strict';

import { TASHKENT_AREA_ADDITIONS } from '../src/tashkent-colloquial.js';
import { matchTashkentHousingLandmarks } from '../src/tashkent-housing-geography.js';

const names = (value) => matchTashkentHousingLandmarks(value).map((entry) => entry.name);

test('TashMI-2 spellings resolve to Shifokorlar-2 in the Tashkent housing lexicon', () => {
  for (const value of ['TashMI-2', 'ToshMI 2', 'ТашМИ-2', 'ТошМИ 2']) {
    assert.ok(names(`${value}, Ташкент`).includes('Shifokorlar-2'), value);
  }
});

test('TashMI-2 remains an alias rather than a second canonical area', () => {
  const areas = TASHKENT_AREA_ADDITIONS.Almazar;
  const shifokorlar2 = areas.find((entry) => entry.name === 'Shifokorlar-2');

  assert.ok(shifokorlar2?.aliases.includes('TashMI-2'));
  assert.equal(areas.some((entry) => entry.name === 'TashMI-2'), false);
  assert.equal(areas.some((entry) => entry.name === 'ToshMI-2'), false);
});
