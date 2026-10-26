import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCvSectionHeading, detectCvSections } from '../src/cv-sections.js';
import { detectCvSeniority, detectHiringSeniority, extractCvExperienceYears } from '../src/hiring-requirements.js';

const REFERENCE = new Date('2026-10-26T00:00:00Z');

const CV = [
  'MARHARYTA KUBAI',
  'SOFTWARE ENGINEER - FRONTEND PLATFORM',
  '',
  'SUMMARY',
  'Frontend-focused software engineer with 6+ years of professional experience.',
  '',
  'PROFESSIONAL EXPERIENCE',
  'BPC | Remote   Jun 2021 - Present',
  'Frontend Developer',
  '• Develop and support production marketplace frontend features.',
  '',
  'ITSUA | Kharkiv   May 2020 - May 2021',
  'Junior Frontend Developer',
  '• Developed a Vue-based Shopify application.',
  '',
  'EDUCATION & LANGUAGES',
  "V. N. Karazin Kharkiv National University - Master's degree, Civil Law (2019-2020)",
  'National Law University - Bachelor\'s degree (2015-2019)',
  'English B2 | Ukrainian Native',
].join('\n')

test('compound headings open the section named first', () => {
  assert.equal(classifyCvSectionHeading('EDUCATION & LANGUAGES'), 'education')
  assert.equal(classifyCvSectionHeading('Skills and Languages'), 'skills')
  assert.equal(classifyCvSectionHeading('Language & Skills'), 'languages')
  assert.equal(classifyCvSectionHeading('Selected Platform & Product Engineering'), null)
})

test('a compound education heading closes the experience span', () => {
  const experience = detectCvSections(CV).find((span) => span.section === 'experience')
  assert.ok(experience, 'experience span exists')
  assert.ok(!CV.slice(experience.contentStart, experience.end).includes('Civil Law'))
})

test('experience years count employment only, not degree dates', () => {
  // Jun 2021..Oct 2026 is 65 months; May 2020..May 2021 is 13. Total 78 months.
  assert.equal(extractCvExperienceYears(CV, REFERENCE), 6.5)
})

test('seniority follows the most recent job, not an earlier junior title', () => {
  assert.equal(detectHiringSeniority(CV), 'junior')
  assert.equal(detectCvSeniority(CV, REFERENCE), null)
})

test('an explicit senior title on the current job is read', () => {
  const cv = CV.replace('BPC | Remote   Jun 2021 - Present\nFrontend Developer', 'BPC | Remote   Jun 2021 - Present\nSenior Frontend Developer')
  assert.equal(detectCvSeniority(cv, REFERENCE), 'senior')
})

test('without dated experience, seniority falls back to the whole CV', () => {
  assert.equal(detectCvSeniority('Summary\nJunior Frontend Developer with a passion for UI.', REFERENCE), 'junior')
})
