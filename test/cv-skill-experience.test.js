import test from 'node:test';
import assert from 'node:assert/strict';
import { attributeCvSkillExperience } from '../src/cv-skill-experience.js';

const REFERENCE = new Date('2026-08-25T00:00:00Z');
const attribute = text => attributeCvSkillExperience(text, { referenceDate: REFERENCE });
const bySkill = (text, skill) => attribute(text).find(item => item.skill === skill);

const CV = [
  'Experience',
  'Backend Engineer, Acme LLC, 2020-01 - 2021-12',
  'Built payment services with Docker and PostgreSQL.',
  'Backend Engineer, Globex Ltd, 2022-01 - present',
  'Maintained Kubernetes clusters and Docker images.',
  'Projects',
  'Hobby tracker, 2019-01 - 2019-06',
  'Weekend app written in Vue.',
  'Skills',
  'Docker, PostgreSQL, Vue, Terraform',
].join('\n');

test('a skill used in a paid role carries commercial evidence', () => {
  const docker = bySkill(CV, 'Docker');
  assert.equal(docker.commercialEvidence, true);
  assert.equal(docker.projectEvidence, false);
  assert.equal(docker.explicitSkillList, true);
});

test('a skill only seen in a side project is not commercial evidence', () => {
  const vue = bySkill(CV, 'Vue');
  assert.equal(vue.commercialEvidence, false);
  assert.equal(vue.projectEvidence, true);
  assert.equal(vue.explicitSkillList, true);
});

test('a skill only listed in the skills section has no demonstrated use', () => {
  const terraform = bySkill(CV, 'Terraform');
  assert.equal(terraform.explicitSkillList, true);
  assert.equal(terraform.commercialEvidence, false);
  assert.equal(terraform.projectEvidence, false);
  assert.equal(terraform.durationMonths, undefined, 'a bare list entry proves no duration');
  assert.equal(terraform.lastUsed, undefined);
});

test('evidence from separate jobs accumulates', () => {
  const docker = bySkill(CV, 'Docker');
  assert.equal(docker.evidenceCount, 3, 'two jobs plus the skills list');
  assert.equal(docker.ledger.independentEvidenceCount, 3);
});

test('a skill repeated inside one job is counted once', () => {
  const cv = ['Experience', 'Engineer, Acme LLC, 2020-01 - 2020-12', 'Used Docker. Then more Docker. Docker everywhere.'].join('\n');
  const docker = bySkill(cv, 'Docker');
  assert.equal(docker.evidenceCount, 1);
  assert.equal(docker.durationMonths, 12);
});

test('duration sums the jobs that actually used the skill', () => {
  const docker = bySkill(CV, 'Docker');
  // Acme 2020-01..2021-12 is 24 months, Globex 2022-01..2026-08 is 56.
  assert.equal(docker.durationMonths, 80);
  const postgres = bySkill(CV, 'PostgreSQL');
  assert.equal(postgres.durationMonths, 24, 'PostgreSQL was only used at the first job');
});

test('overlapping jobs do not double-count a skill duration', () => {
  const cv = ['Experience', 'Engineer, Acme LLC, 2020-01 - 2021-12', 'Used Docker.', 'Consultant, Globex Ltd, 2021-01 - 2022-12', 'Used Docker.'].join('\n');
  const docker = bySkill(cv, 'Docker');
  assert.equal(docker.evidenceCount, 2, 'two jobs are still two pieces of evidence');
  assert.equal(docker.durationMonths, 36, '2020-01 through 2022-12 is 36 months, not 48');
});

test('lastUsed is the end of the most recent job that used the skill', () => {
  assert.deepEqual({ ...bySkill(CV, 'PostgreSQL').lastUsed }, { year: 2021, month: 12, precision: 'month' });
  const docker = bySkill(CV, 'Docker');
  assert.deepEqual({ ...docker.lastUsed }, { year: 2026, month: 8, precision: 'month' });
  assert.equal(docker.stillInUse, true, 'the most recent job using Docker is ongoing');
});

test('a skill dropped years ago is not marked as still in use', () => {
  const postgres = bySkill(CV, 'PostgreSQL');
  assert.equal(postgres.stillInUse, false);
});

test('commercial evidence outranks a bare skills-list mention', () => {
  const ranked = attribute(CV).map(item => item.skill);
  assert.ok(ranked.indexOf('Docker') < ranked.indexOf('Terraform'), 'Docker is demonstrated, Terraform is only claimed');
  assert.ok(bySkill(CV, 'Docker').ledger.score > bySkill(CV, 'Terraform').ledger.score);
});

test('every entry carries a ledger whose occurrences point back at the text', () => {
  const docker = bySkill(CV, 'Docker');
  assert.equal(docker.ledger.occurrences.length, 3);
  for (const occurrence of docker.ledger.occurrences) {
    assert.equal(occurrence.entityId, 'Docker');
    assert.ok(occurrence.end > occurrence.start);
    assert.ok(CV.slice(occurrence.start, occurrence.end).length > 0);
  }
});

test('a CV with no skills produces no entries', () => {
  assert.deepEqual(attribute(''), []);
  assert.deepEqual(attribute('Experience\nWorked somewhere, 2020 - 2021\n'), []);
});

test('a CV with no headings still attributes what it can', () => {
  const entries = attribute('Engineer, Acme LLC, 2020-01 - 2020-12\nUsed Docker.\n');
  const docker = entries.find(item => item.skill === 'Docker');
  assert.equal(docker.commercialEvidence, true, 'an unheaded document is treated as experience, not as a list');
  assert.equal(docker.durationMonths, 12);
});
