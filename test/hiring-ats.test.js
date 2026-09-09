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

test('package ATS keeps server-only skills as contextual evidence', () => {
  const result = scoreHiringAts('Skills\nDocker', {
    title: 'Backend Engineer',
    skills: ['Docker', 'PostgreSQL'],
  }, { fuzzySkills: true });
  assert.ok(result.matched.includes('Docker'));
  assert.equal(result.missing.includes('PostgreSQL'), false);
  assert.ok(result.breakdown.skills > 0);
});

test('package ATS only permits ambiguous bare skills in an explicit skills section', () => {
  const prose = buildHiringAtsProfile('I enjoy spring season and good weather.', { fuzzySkills: true });
  const skills = buildHiringAtsProfile('Skills\nSpring', { fuzzySkills: true });
  assert.equal(prose.skills.has('Spring'), false);
  assert.equal(skills.skills.has('Spring'), true);
});

test('a skill under an explicit Skills heading outscores the same skill in unclassified preamble text', () => {
  const inSkillsSection = scoreHiringAts('Skills\nDocker', { title: 'Backend Engineer', skills: ['Docker'] }, { fuzzySkills: true });
  const inPreamble = scoreHiringAts('Docker is used here.\nSkills\nPython', { title: 'Backend Engineer', skills: ['Docker'] }, { fuzzySkills: true });
  assert.ok(inSkillsSection.breakdown.skills > inPreamble.breakdown.skills);
});
