import test from 'node:test';
import assert from 'node:assert/strict';

import { TASHKENT_AREAS, UZ_LOCATION_EXTENSIONS } from '../src/index.js';

test('legacy Tashkent areas use the same Taxtapul canonical as the extension layer', () => {
  const legacy = TASHKENT_AREAS.Almazar.find(({ canonical }) => canonical === 'Taxtapul');
  const extension = UZ_LOCATION_EXTENSIONS.Tashkent.localAreas.find(({ canonical }) => canonical === 'Taxtapul');

  assert.ok(legacy);
  assert.ok(extension);
  assert.equal(TASHKENT_AREAS.Almazar.some(({ canonical }) => canonical === 'Takhtapul'), false);
  assert.ok(legacy.aliases.includes('Takhtapul'));
  assert.ok(extension.aliases.includes('Takhtapul'));
});

test('legacy Tashkent aliases preserve current and historical listing spellings', () => {
  const chimbay = TASHKENT_AREAS.Almazar.find(({ canonical }) => canonical === 'Chimbay');
  const yalangach = TASHKENT_AREAS['Mirzo Ulugbek'].find(({ canonical }) => canonical === 'Yalangach');

  assert.ok(chimbay?.aliases.includes('чимбой'));
  assert.ok(yalangach?.aliases.includes("yalang'och dahasi"));
  assert.ok(yalangach?.aliases.includes('ялангач массив'));
  assert.ok(yalangach?.aliases.includes('массив высоковольтный'));
});
