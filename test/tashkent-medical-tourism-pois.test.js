import test from 'node:test';
import assert from 'node:assert/strict';

import { matchTashkentPoi, TASHKENT_MEDICAL_POIS } from '../src/tashkent-pois.js';

const byName = new Map(TASHKENT_MEDICAL_POIS.map((entry) => [entry.name, entry]));

test('Tashkent medical-tourism POIs are present in the medical catalog', () => {
  for (const name of [
    'AKFA Medline',
    'Shifo Nur',
    'Nano Medical Clinic',
    'Medas Medical Center',
    'Prof Med Clinic',
    'Dr. Akshay Kumar Eye Clinic',
    'Shox International Hospital',
  ]) {
    assert.equal(byName.get(name)?.category, 'medical', name);
  }
});

test('medical-tourism aliases resolve to their canonical POIs', () => {
  const cases = [
    ['AKFA MEDLINE', 'AKFA Medline'],
    ['Шифо Нур', 'Shifo Nur'],
    ['Клиника Нано', 'Nano Medical Clinic'],
    ['Medas Group', 'Medas Medical Center'],
    ['ProfMedService', 'Prof Med Clinic'],
    ['Vedanta Medical', 'Dr. Akshay Kumar Eye Clinic'],
    ['Shox Hospital', 'Shox International Hospital'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(matchTashkentPoi(input, 'medical')?.name, expected, input);
  }
});
