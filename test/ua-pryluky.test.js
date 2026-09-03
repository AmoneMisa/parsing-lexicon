import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Pryluky dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Pryluky');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Pryluky Railway Station'));
  assert.ok(names.has('Прилуцький краєзнавчий музей імені В. І. Маслова'));
  assert.ok(names.has('Собор Різдва Пресвятої Богородиці'));
});

test('Pryluky landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ['Прилуцький краєзнавчий музей ім. В. І. Маслова', 'Прилуцький краєзнавчий музей імені В. І. Маслова'],
    ['Прилуцький краєзнавчий музей ім. В.І. Маслова', 'Прилуцький краєзнавчий музей імені В. І. Маслова'],
    ['Собор Різдва Богородиці', 'Собор Різдва Пресвятої Богородиці'],
    ['Собор Різдва Богородиці (Прилуки)', 'Собор Різдва Пресвятої Богородиці'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Pryluky');
    assert.equal(match?.city, 'Pryluky');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
