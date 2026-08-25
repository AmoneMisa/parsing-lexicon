import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bucketVacancyText,
  classifyCvSectionHeading,
  detectDegreeFields,
  detectDegreeLevel,
  detectHiringSeniority,
  extractCvExperienceYears,
  extractCvSection,
  extractRequiredExperienceYears,
  hasUsWorkAuthorization,
  isNoSponsorshipRequirement,
  requiresUsSponsorship,
} from '../src/hiring-requirements.js';

test('detects reusable seniority and education semantics', () => {
  assert.equal(detectHiringSeniority('Principal Software Engineer'), 'principal');
  assert.equal(detectHiringSeniority('ведущий разработчик'), 'lead');
  assert.equal(detectDegreeLevel("Master's degree in Law"), 'master');
  assert.deepEqual(detectDegreeFields('Master of Law and forensic studies'), ['law', 'forensics']);
});

test('extracts experience requirements through the shared experience parser', () => {
  assert.equal(extractRequiredExperienceYears('At least 5 years of professional experience'), 5);
  assert.equal(extractRequiredExperienceYears('Опыт от 3 лет'), 3);
});

test('normalizes US work authorization and sponsorship evidence', () => {
  assert.equal(hasUsWorkAuthorization('Authorized to work in the United States without sponsorship'), true);
  assert.equal(requiresUsSponsorship('Citizenship: Ukraine'), true);
  assert.equal(requiresUsSponsorship('US citizen'), false);
  assert.equal(isNoSponsorshipRequirement('We may not be able to provide future visa sponsorship for this role.'), true);
});

test('handles dotted abbreviations inside long sponsorship clauses', () => {
  const text = 'For US based roles only, the Company may not be able to employ candidates for this role who have United States work authorization related to certain U.S. visa categories, or support future H-1B sponsorship at this time.';
  assert.equal(isNoSponsorshipRequirement(text), true);
});

test('buckets vacancy requirements without treating benefits and legal text as requirements', () => {
  const result = bucketVacancyText('Requirements: Vue and TypeScript. 5 years experience. Nice to have: GraphQL. Benefits: health insurance. Equal opportunity employer.');
  assert.match(result.required, /Vue and TypeScript/i);
  assert.match(result.optional, /GraphQL/i);
  assert.doesNotMatch(result.required, /health insurance/i);
  assert.match(result.noise, /Equal opportunity/i);
});

test('classifies CV sections and extracts employment evidence centrally', () => {
  const cv = 'Profile\nFrontend developer\nWork Experience\n2020-01 - 2022-12 Company A\n2023-01 - present Company B\nSkills\nVue, TypeScript';
  assert.equal(classifyCvSectionHeading('Work Experience'), 'experience');
  assert.match(extractCvSection(cv, 'experience'), /Company A/);
  assert.doesNotMatch(extractCvSection(cv, 'experience'), /Vue/);
  assert.equal(extractCvExperienceYears(cv, new Date('2026-08-25T00:00:00Z')), 5.8);
});

test('explicit experience can supply CV experience without dated employment rows', () => {
  assert.equal(extractCvExperienceYears('Professional summary: over 5 years of commercial experience.'), 5);
});
