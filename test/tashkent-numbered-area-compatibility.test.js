import test from 'node:test';
import assert from 'node:assert/strict';

import { TASHKENT_AREA_ADDITIONS } from '../src/tashkent-colloquial.js';
import { UZ_LOCATION_EXTENSIONS } from '../src/uz-location-extensions.js';

const canonicalAreas = UZ_LOCATION_EXTENSIONS.Tashkent.localAreas;

function assertCompatibilitySeries(district, prefix, numbers) {
  const compatibility = TASHKENT_AREA_ADDITIONS[district] || [];

  for (const number of numbers) {
    const canonical = `${prefix}-${number}`;
    const compatibilityMatches = compatibility.filter((entry) => entry.name === canonical);
    const canonicalMatches = canonicalAreas.filter((entry) => entry.name === canonical);

    assert.equal(compatibilityMatches.length, 1, `${canonical} compatibility owner`);
    assert.equal(canonicalMatches.length, 1, `${canonical} canonical owner`);
    assert.equal(canonicalMatches[0]?.parent, district, `${canonical} parent`);
  }
}

test('legacy Tashkent area view covers the full official Shifokorlar series', () => {
  assertCompatibilitySeries('Almazar', 'Shifokorlar', [1, 2, 3, 4, 5, 6]);
});

test('legacy Tashkent area view covers the full official Suvsoz series', () => {
  assertCompatibilitySeries('Bektemir', 'Suvsoz', [1, 2, 3, 4, 5]);
});
