import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSalary } from '../src/money.js';
import { parseHiringSalaryWithContext, parseHiringVacancySalary } from '../src/hiring-salary-context.js';
import { detectHiringEducation, extractHiringAgeRange } from '../src/hiring-vacancy-fields.js';
import { detectEmploymentTypes, detectWorkModes, detectWorkSchedules } from '../src/hiring-work-semantics.js';

const exadel = `
Senior Backend Engineer (.NET)
Project Tech Stack
Azure Cloud, Microservices Architecture, .NET 8, ASP.NET Core services, Mongo, Azure SQL, Angular 18, Kendo, GitHub Enterprise with Copilot
What You Bring
Bachelor's or Master’s degree in Computer Science, Software Engineering, or equivalent practical experience.
Extensive background in software engineering, with a proven track record of technical leadership.
Nice to have
Expertise in containerization and orchestration tools such as Docker and Kubernetes
English level
Intermediate+
Compensation details are shared with candidates at the early stage of the recruitment process.
Your Benefits at Exadel
In-office, hybrid, or remote flexibility
Employment type
Full-time
`;

test('salary parser accepts common malformed Uzbekistan grouped spacing', () => {
  assert.deepEqual(parseSalary('З/П: от 4 00 000 сум'), {
    min: 400000,
    max: null,
    currency: 'UZS',
    period: null,
    gross: null,
    negotiable: false,
    approximate: false,
  });
});

test('salary parser protects schedule/time numbers from becoming compensation', () => {
  assert.deepEqual(parseSalary('З/П: договорная. График 6/1, 09:00-18:00'), {
    min: null,
    max: null,
    currency: null,
    period: null,
    gross: null,
    negotiable: true,
    approximate: false,
  });
  assert.deepEqual(detectWorkSchedules('График 6/1, 09:00-18:00'), ['sixOne']);
});

test('job-board token separators preserve a complete salary range', () => {
  const text = 'Водитель грузовика и фуры · 2 500 · - 3 000 · € · ООО Ка Т, ТОО | Алматы, KZ · в Ташкенте, полная занятость, опыт работы от 2 лет';
  assert.deepEqual(parseSalary(text), {
    min: 2500,
    max: 3000,
    currency: 'EUR',
    period: null,
    gross: null,
    negotiable: false,
    approximate: false,
  });
  const contextual = parseHiringVacancySalary(text, { country: 'UZ', periodFallback: 'country' });
  assert.equal(contextual?.period, 'month');
  assert.equal(contextual?.periodSource, 'country-default');
});

test('Uzbekistan vacancy salary can opt into monthly market fallback with provenance', () => {
  const parsed = parseHiringSalaryWithContext('З/П: 6 000 000 сум', {
    country: 'UZ',
    periodFallback: 'country',
  });
  assert.equal(parsed?.min, 6000000);
  assert.equal(parsed?.max, 6000000);
  assert.equal(parsed?.currency, 'UZS');
  assert.equal(parsed?.period, 'month');
  assert.equal(parsed?.periodSource, 'country-default');
  assert.equal(parsed?.periodCountry, 'UZ');
});

test('explicit vacancy age ranges are separated from experience years', () => {
  assert.deepEqual(extractHiringAgeRange('Возраст: от 18 до 35 лет. Опыт 3 года.'), { min: 18, max: 35 });
  assert.deepEqual(extractHiringAgeRange('20 dan 40 yoshgacha, tajriba 2 yil'), { min: 20, max: 40 });
});

test('Bachelor or Master vacancy wording exposes Bachelor as the minimum accepted degree', () => {
  assert.equal(detectHiringEducation(exadel), 'bachelor');
});

test('Exadel live-source prose keeps work metadata but does not invent compensation', () => {
  assert.equal(parseHiringVacancySalary(exadel, { country: 'UZ', periodFallback: 'country' }), null);
  assert.deepEqual(detectEmploymentTypes(exadel), ['full_time']);
  assert.deepEqual(detectWorkModes(exadel), ['remote', 'hybrid', 'onsite']);
});
