import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHiringAtsProfile, scoreHiringAts } from '../src/hiring-ats.js';

test('package ATS preserves explainable required/optional weighting', () => {
  const profile = buildHiringAtsProfile('Experience\nBuilt services with TypeScript and PostgreSQL.\nSkills: Docker', { fuzzySkills: true });
  const result = scoreHiringAts(profile, { title: 'Backend Engineer', skills: ['TypeScript', 'PostgreSQL'], niceToHave: ['Docker'] });
  assert.ok(result.matched.includes('TypeScript'));
  assert.ok(result.matched.includes('PostgreSQL'));
  assert.ok(result.breakdown.skills > 70);
  assert.deepEqual(result.blockers, []);
});

test('package ATS discounts fuzzy CV skill evidence below exact evidence', () => {
  const fuzzy = scoreHiringAts('Skills\nPostgress', { title: 'Backend Engineer', skills: ['PostgreSQL'] }, { fuzzySkills: true });
  const exact = scoreHiringAts('Skills\nPostgreSQL', { title: 'Backend Engineer', skills: ['PostgreSQL'] }, { fuzzySkills: true });
  assert.ok(fuzzy.breakdown.skills < exact.breakdown.skills);
  assert.ok(fuzzy.breakdown.skills > 0);
});
