import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultHiringCurrency,
  detectCandidatePostSignals,
  extractCandidateStructuredBlock,
  isHiringCharityAppeal,
  isHiringRecruitingOpportunity,
  sameHiringProfessionFamily,
} from '../src/hiring-source-semantics.js';

test('candidate post signals cover multilingual structured and first-person CVs', () => {
  const structured = detectCandidatePostSignals('Ismi: Ali\nYoshi: 24\nTajribasi: 3 yil\nAloqa: @ali_dev');
  assert.equal(structured.candidateForm, true);
  assert.equal(structured.contact, true);
  assert.ok(structured.sectionCount >= 1);
  const free = detectCandidatePostSignals('Ищу работу Frontend Developer. Мне 25 лет. Telegram: @dev_user');
  assert.equal(free.firstPerson, true);
  assert.equal(free.personalProfile, true);
});

test('structured candidate blocks reuse shared field aliases', () => {
  assert.equal(extractCandidateStructuredBlock('Education:\nUniversity of Kyiv\nLanguages:\nEnglish B2', 'education'), 'University of Kyiv');
});

test('shared hiring post exclusions classify charity and recruiting programs', () => {
  assert.equal(isHiringCharityAppeal('Благодійний збір коштів. Допоможіть родині, monobank банка збору.'), true);
  assert.equal(isHiringCharityAppeal('Маю досвід волонтерства.'), false);
  assert.equal(isHiringRecruitingOpportunity('Academy training program. Registration until 30 August. Limited spots.'), true);
  assert.equal(isHiringRecruitingOpportunity('Senior Engineer vacancy'), false);
});

test('shared hiring defaults and profession families are deterministic', () => {
  assert.equal(defaultHiringCurrency('UZ'), 'UZS');
  assert.equal(defaultHiringCurrency('ro'), 'RON');
  assert.equal(sameHiringProfessionFamily('Frontend Developer', 'Backend Developer'), true);
  assert.equal(sameHiringProfessionFamily('Product Manager', 'Backend Developer'), false);
});
