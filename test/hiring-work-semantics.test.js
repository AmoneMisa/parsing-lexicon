import test from 'node:test';
import assert from 'node:assert/strict';

import {
  detectEmploymentTypes,
  detectExperienceRequirement,
  detectProbation,
  detectWorkModes,
  detectWorkSchedules,
  extractWorkTimeRanges,
} from '../src/hiring-work-semantics.js';

test('shared work semantics normalize employment and workplace modes', () => {
  assert.deepEqual(detectEmploymentTypes('Full-time, можно freelance'), ['full_time', 'freelance']);
  assert.deepEqual(detectWorkModes('Гибридный формат, remote possible'), ['remote', 'hybrid']);
});

test('shared work semantics cover base and extended schedules', () => {
  assert.deepEqual(detectWorkSchedules('График 5/2 или 6/1'), ['fiveTwo', 'sixOne']);
  assert.deepEqual(detectWorkSchedules('24/48 night shift'), ['shift', 'night', 'twentyFourFortyEight']);
  assert.deepEqual(
    extractWorkTimeRanges('Два сменных варианта: 1-я смена с 08:00 до15:00; 2-я смена с 15:30 до 23:00'),
    [{ start: '08:00', end: '15:00' }, { start: '15:30', end: '23:00' }],
  );
});

test('shared work semantics resolve probation and experience requirements', () => {
  assert.equal(detectProbation('испытательный срок оплачивается'), 'paidProbation');
  assert.equal(detectExperienceRequirement('Можно без опыта, обучаем'), 'noExperience');
  assert.equal(detectExperienceRequirement('Требуется опыт работы'), 'experienceRequired');
});
