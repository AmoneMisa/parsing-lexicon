import test from 'node:test';
import assert from 'node:assert/strict';

import { matchOdesaMetropolitanEntities } from '../src/odesa-metropolitan.js';

for (const text of [
  'Малый Фонтан',
  'Малий Фонтан',
  'район Малого Фонтана',
  'на Малом Фонтане',
  'на Малому Фонтані',
]) {
  test(`recognizes Odesa Malyi Fontan local area: ${text}`, () => {
    const result = matchOdesaMetropolitanEntities(text);
    assert.ok(result.matches.some((item) => item.type === 'local_area' && item.name === 'Малий Фонтан'));
  });
}
