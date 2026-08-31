import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

for (const alias of ['Обрій', 'Обрий', 'Obrii', 'Горизонт']) {
  test(`Kharkiv ${alias} resolves to legacy Horizont canonical`, () => {
    const result = matchDictionaryLocation(alias, 'UA', 'Kharkiv');
    assert.equal(result?.type, 'microdistricts');
    assert.equal(result?.name, 'Horizont');
  });
}
