import test from 'node:test';
import assert from 'node:assert/strict';
import { detectCityFromText, detectCountryCodeFromText } from '../src/geography-detection.js';
import {
  detectCandidateFeatureCodes,
  detectCandidateProfessionLabels,
  detectCandidateRelocationPreference,
  detectCandidateRemotePreference,
  detectDegreeRequirement,
  detectHiringScopeSignals,
  detectManagementRole,
  extractCandidateContactHours,
  extractCandidateGoalField,
  extractCandidateGoalRole,
  extractCandidateLocationField,
  extractCandidateRoleField,
  extractCandidateSalaryField,
  extractCandidateSkillField,
  extractCandidateTargetContext,
  extractCandidateWorkHistory,
  isCandidateNonRoleValue,
  isCandidateNonTargetContext,
  isCandidateStatusOnly,
  isFlexibleCandidateRole,
} from '../src/hiring-semantics.js';

test('shared geography detection resolves country and city aliases without matching English us', () => {
  assert.equal(detectCountryCodeFromText('Tashkent, Uzbekistan'), 'UZ');
  assert.equal(detectCountryCodeFromText('Berlin'), 'DE');
  assert.equal(detectCountryCodeFromText('San Mateo, CA'), 'US');
  assert.equal(detectCountryCodeFromText('Remote US'), 'US');
  assert.equal(detectCountryCodeFromText('#Canada'), 'CA');
  assert.equal(detectCountryCodeFromText('Contact us for details'), null);
  assert.deepEqual(detectCityFromText('Работа в Ташкенте', 'UZ'), { canonical: 'Tashkent', country: 'UZ' });
});

test('candidate field semantics preserve structured multilingual CV extraction', () => {
  const text = [
    'Ищу работу: Frontend Developer',
    'Position: Backend Developer',
    'Goal: Product company',
    'Локація #Canada',
    'Опыт работы: 3 года как QA',
    'Skills: Vue, TypeScript, Nuxt',
    'Murojaat qilish vaqti: 8:00 - 22:00',
    'Salary: 1500 USD',
  ].join('\n');

  assert.equal(isCandidateNonTargetContext('Опыт работы: QA'), true);
  assert.match(extractCandidateTargetContext(text), /Frontend Developer/);
  assert.doesNotMatch(extractCandidateTargetContext(text), /QA/);
  assert.equal(extractCandidateSkillField(text), 'Vue, TypeScript, Nuxt');
  assert.equal(extractCandidateRoleField(text), 'Backend Developer');
  assert.equal(extractCandidateGoalField(text), 'Product company');
  assert.equal(extractCandidateLocationField(text), '#Canada');
  assert.match(extractCandidateWorkHistory(text), /3 года как QA/);
  assert.equal(extractCandidateContactHours(text), '8:00 - 22:00');
  assert.equal(extractCandidateSalaryField(text), '1500 USD');
});

test('candidate goal, features, role and relocation semantics are reusable', () => {
  assert.equal(
    extractCandidateGoalRole('Maqsad: frontend dasturchi sifatida ish topish'),
    'frontend dasturchi',
  );
  assert.deepEqual(
    detectCandidateFeatureCodes('Студент, ищу подработку, готов к переезду'),
    ['student', 'partTime', 'openToRelocation'],
  );
  assert.equal(detectCandidateRelocationPreference('Не готов к переезду'), false);
  assert.equal(detectCandidateRelocationPreference('Готов к переезду'), true);
  assert.equal(isCandidateStatusOnly('talaba'), true);
  assert.equal(isFlexibleCandidateRole('Любая работа'), true);
  assert.equal(isCandidateNonRoleValue('онлайн'), true);
  assert.equal(detectCandidateRemotePreference('Только офис'), false);
  assert.equal(detectCandidateRemotePreference('Ищу удалённую работу'), true);
});

test('candidate profession repair keeps role semantics out of consumer regex catalogs', () => {
  assert.deepEqual(detectCandidateProfessionLabels('#hr, people partner'), ['HR / Recruiter']);
  assert.deepEqual(detectCandidateProfessionLabels('backend dasturchi'), ['Backend Developer']);
  assert.deepEqual(detectCandidateProfessionLabels('', 'Flutter, Dart'), ['Mobile Developer']);
  assert.deepEqual(detectCandidateProfessionLabels('', 'Cisco, Linux, Active Directory'), ['System Administrator']);
  assert.deepEqual(detectCandidateProfessionLabels('', 'Vue.js, TypeScript, Node.js'), ['Software Developer']);
});

test('management, scope and degree semantics are extracted without scoring policy', () => {
  assert.equal(detectManagementRole('Engineering Manager', ''), true);
  assert.equal(detectManagementRole('Frontend Developer', 'Individual contributor role'), null);
  assert.deepEqual(
    detectHiringScopeSignals('Own critical systems, mentor engineers and work on system design', { mode: 'vacancy' }),
    ['architecture', 'mentoring', 'ownership'],
  );
  assert.deepEqual(
    detectHiringScopeSignals('Architected systems and mentored developers at scale', { mode: 'candidate' }),
    ['architecture', 'mentoring', 'scale'],
  );
  assert.deepEqual(
    detectDegreeRequirement("Bachelor's degree in Computer Science or equivalent work experience"),
    { level: 'bachelor', field: 'computer_science', equivalentExperience: true },
  );
});

test('shared employment lexicon recognizes legacy incomplete-employment wording', async () => {
  const { EMPLOYMENT_TYPES, findCanonical } = await import('../src/index.js');
  const partTime = EMPLOYMENT_TYPES.find(({ canonical }) => canonical === 'partTime');
  assert.equal(findCanonical('неполная занятость, удаленно', [partTime], { partial: true })?.canonical, 'partTime');
});
