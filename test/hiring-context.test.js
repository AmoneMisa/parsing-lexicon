import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyHiringMessage, parseHiringContext, parseLanguageContext, resolveProfessionContext } from '../src/index.js';

test('language requirements bind relation to each language', () => {
  const parsed = parseLanguageContext('English required, Russian preferred');
  assert.equal(parsed.find(({ language }) => language === 'en')?.relation, 'required');
  assert.equal(parsed.find(({ language }) => language === 'ru')?.relation, 'preferred');
});

test('candidate language relation differs from vacancy requirement', () => {
  const parsed = parseLanguageContext('I speak English B2 and Russian fluently', { mode: 'candidate' });
  const english = parsed.find(({ language }) => language === 'en');
  assert.equal(english?.relation, 'candidateHas');
  assert.equal(english?.cefr, 'B2');
});

test('vacancy profession is distinct from professions mentioned in duties', () => {
  const parsed = resolveProfessionContext('📌 Должность: HR Manager\n📋 Обязанности: нанимать software developers and designers', { mode: 'vacancy' });
  assert.equal(parsed.vacancyProfession?.id, 'hr_manager');
  assert.ok(parsed.mentionedProfessions.some(({ id }) => id === 'software_developer'));
});

test('candidate current and desired profession are separated', () => {
  const parsed = resolveProfessionContext('Работал бухгалтером 5 лет. Ищу работу финансовым аналитиком.', { mode: 'candidate' });
  assert.equal(parsed.desiredProfession?.id, 'financial_analyst');
  assert.ok(parsed.previousProfessions.some(({ id }) => id === 'accountant'));
});

test('visa sponsorship negative signal remains explicit', () => {
  const parsed = parseHiringContext('Frontend Developer. Must be authorized to work in the US. No visa sponsorship.', { mode: 'vacancy' });
  assert.ok(parsed.workAuthorization.includes('noSponsorship'));
  assert.ok(parsed.workAuthorization.includes('workPermitRequired'));
});

test('explicit we-do-sponsor wording is recognized as sponsorship offered', () => {
  const parsed = parseHiringContext(
    "Visa sponsorship: We do sponsor visas! However, we aren't able to successfully sponsor visas for every role and every candidate.",
    { mode: 'vacancy' },
  );
  assert.ok(parsed.workAuthorization.includes('sponsorshipOffered'));
  assert.ok(!parsed.workAuthorization.includes('noSponsorship'));
});

test('classifies obvious job-service and closed-vacancy noise', () => {
  assert.equal(classifyHiringMessage('Помогу найти работу. Подбор вакансий под ваше резюме.'), 'job_service');
  assert.equal(classifyHiringMessage('Вакансия закрыта, сотрудник найден.'), 'closed_vacancy');
});
