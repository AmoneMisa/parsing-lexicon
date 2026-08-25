import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PROFESSION_CATALOG,
  PROFESSION_GROUPS,
  classifyHiringIntent,
  collectAliasCollisions,
  matchProfession,
  matchProfessions,
  matchSeniority,
  parseExperience,
  parseSalary,
} from '../src/index.js';

test('salary parser understands compact multilingual ranges and periods', () => {
  assert.deepEqual(parseSalary('ЗП 8–12 млн сум в месяц'), {
    min: 8_000_000,
    max: 12_000_000,
    currency: 'UZS',
    period: 'month',
    gross: null,
    negotiable: false,
    approximate: false,
  });
  assert.equal(parseSalary('от 500к тг на руки')?.min, 500_000);
  assert.equal(parseSalary('от 500к тг на руки')?.currency, 'KZT');
  assert.equal(parseSalary('от 500к тг на руки')?.gross, false);
  assert.equal(parseSalary('$30/hour')?.min, 30);
  assert.equal(parseSalary('$30/hour')?.period, 'hour');
  assert.equal(parseSalary("15 mln so'm oyiga")?.min, 15_000_000);
  assert.equal(parseSalary("15 mln so'm oyiga")?.currency, 'UZS');
});

test('salary parser distinguishes gross net negotiable and upper bound', () => {
  assert.equal(parseSalary('300 000 тг до вычета налогов')?.gross, true);
  assert.equal(parseSalary('salary negotiable')?.negotiable, true);
  assert.deepEqual(
    (({ min, max }) => ({ min, max }))(parseSalary('до 2500 EUR monthly')),
    { min: null, max: 2500 },
  );
});

test('profession taxonomy separates profession groups and specific roles', () => {
  assert.ok(PROFESSION_CATALOG.length >= 180);
  assert.ok(PROFESSION_GROUPS.some((group) => group.canonical === 'software_development'));
  assert.equal(matchProfession('Senior React Frontend Engineer')?.canonical, 'frontend_developer');
  assert.equal(matchProfession('нужен бухгалтер по заработной плате')?.canonical, 'payroll_accountant');
  assert.equal(matchProfession('водитель категории CE')?.canonical, 'truck_driver');
  assert.equal(matchProfession('QA Automation Engineer')?.canonical, 'qa_automation_engineer');
});

test('profession matcher returns multiple distinct structured roles', () => {
  const matches = matchProfessions('Ищем recruiter и sales manager в команду', { limit: 5 });
  assert.ok(matches.some((item) => item.canonical === 'recruiter'));
  assert.ok(matches.some((item) => item.canonical === 'sales_manager'));
});

test('seniority keeps lead staff principal and senior separate', () => {
  assert.equal(matchSeniority('Senior Frontend Developer')?.canonical, 'senior');
  assert.equal(matchSeniority('Lead Frontend Developer')?.canonical, 'lead');
  assert.equal(matchSeniority('Staff Software Engineer')?.canonical, 'staff');
  assert.equal(matchSeniority('Principal Engineer')?.canonical, 'principal');
  assert.equal(matchSeniority('Head of Engineering')?.canonical, 'head');
});

test('hiring intent rejects closed roles and course ads before employer intent', () => {
  assert.equal(classifyHiringIntent('Вакансия закрыта, сотрудник найден').intent, 'negative');
  assert.equal(classifyHiringIntent('Курс с трудоустройством: стань программистом').intent, 'negative');
  assert.equal(classifyHiringIntent('Расширяем команду, открыта позиция бухгалтера').intent, 'employer');
  assert.equal(classifyHiringIntent('Рассмотрю предложения, ищу удалёнку').intent, 'candidate');
});

test('experience parser handles none preferred min and ranges', () => {
  assert.deepEqual(parseExperience('можно без опыта'), { requirement: 'none', minYears: 0, maxYears: 0 });
  assert.deepEqual(parseExperience('опыт 1-3 года'), { requirement: 'required', minYears: 1, maxYears: 3 });
  assert.deepEqual(parseExperience('не менее 2 лет'), { requirement: 'required', minYears: 2, maxYears: null });
  assert.equal(parseExperience('experience preferred')?.requirement, 'preferred');
});

test('collision collector exposes strong profession alias collisions instead of silently hiding them', () => {
  const direct = PROFESSION_CATALOG.map((item) => ({ canonical: item.canonical, aliases: item.strongAliases }));
  const collisions = collectAliasCollisions(direct);
  assert.ok(Array.isArray(collisions));
  assert.ok(collisions.every((item) => item.alias && item.canonicals.length > 1));
});
