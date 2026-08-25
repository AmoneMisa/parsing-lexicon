import assert from 'node:assert/strict';
import test from 'node:test';

import {
  extractCandidateAge,
  extractCandidateContacts,
  extractCandidateExperienceYears,
  extractCandidateGender,
  extractCandidateName,
} from '../src/hiring-candidate-fields.js';
import {
  extractHiringDeadline,
  parseHiringActivityDate,
  parseHiringDayMonthDate,
} from '../src/hiring-temporal.js';
import {
  detectApplicationLanguage,
  detectHiringEducation,
} from '../src/hiring-vacancy-fields.js';

test('candidate identity fields cover explicit and grammatical multilingual signals', () => {
  assert.equal(extractCandidateGender('Каримова Малика'), 'female');
  assert.equal(extractCandidateGender("Akmal o'g'li"), 'male');
  assert.equal(extractCandidateGender('Любая работа'), undefined);
  assert.equal(extractCandidateName('FIO: Akmal Karimov\nYashash manzili: Toshkent'), 'Akmal Karimov');
  assert.equal(extractCandidateAge('Возраст: 28'), 28);
  assert.equal(extractCandidateAge("Tug'ilgan yili: 1996", new Date('2026-08-25T12:00:00Z')), 30);
});

test('candidate experience and contacts reject common false positives', () => {
  assert.equal(extractCandidateExperienceYears('Опыт работы: 2 года'), 2);
  assert.equal(extractCandidateExperienceYears('ish tajribasi talab qilinmaydi'), 0);
  assert.deepEqual(
    extractCandidateContacts('2007 - 2009\n+998 90 123 45 67\nmail@example.com\n@candidate_user'),
    { phone: '+998 90 123 45 67', email: 'mail@example.com', telegram: '@candidate_user' },
  );
});

test('temporal parsing handles absolute, relative and day-month hiring dates', () => {
  const now = new Date('2026-08-25T12:00:00Z');
  assert.equal(parseHiringActivityDate('сегодня', now), now.toISOString());
  assert.equal(parseHiringActivityDate('2 дня назад', now), '2026-08-23T12:00:00.000Z');
  assert.equal(parseHiringActivityDate('19 августа, 2026', now), '2026-08-19T12:00:00.000Z');
  assert.equal(parseHiringDayMonthDate('19 августа', now), '2026-08-19T12:00:00.000Z');
  assert.equal(extractHiringDeadline('Application deadline: 30 September 2026.'), '30 September 2026');
});

test('vacancy field semantics centralize education and application language', () => {
  assert.equal(detectHiringEducation("Master's degree required"), 'master');
  assert.equal(detectHiringEducation('Высшее образование'), 'higher');
  assert.equal(detectApplicationLanguage('Please submit your CV in English.'), 'English');
  assert.equal(detectApplicationLanguage('Отправьте CV на русском'), 'Russian');
});
