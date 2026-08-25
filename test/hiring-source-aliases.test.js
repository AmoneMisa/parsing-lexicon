import test from 'node:test';
import assert from 'node:assert/strict';

import {
  matchExtendedProfessions,
  matchesSourceCandidateIntent,
  professionDisplayLabel,
} from '../src/hiring-source-aliases.js';

test('source profession aliases keep migrated consumer spellings in the shared package', () => {
  const cases = [
    ['CEO', ['Chief Executive Officer']],
    ['CTO', ['Chief Technology Officer']],
    ['Neft vagaz sohasida', ['Oil & Gas Worker']],
    ['Менеджер экспортных продаж РФ', ['Sales Manager']],
    ['СЕ КАТЕГОРИЯ БУЙИЧА', ['Driver']],
    ["Metrologiya, audit, standartlashtirish sohasi bo'yicha", ['Metrology Specialist']],
    ['xavfsizlik, qoriqlash', ['Security Guard']],
    ['Bank,soliq , universitetda titur', ['Finance / Banking Specialist', 'Teacher']],
    ['Kompyuter boyicha ish', ['IT Specialist']],
    ['Biotexnolog, laborant', ['Biotechnologist', 'Laboratory Technician']],
    ['Matbuot', ['Media Specialist']],
    ['Injiner', ['Engineer']],
    ['Koll-markaz operatori', ['Call Center Operator']],
    ['Arxitektor loyihachi', ['Architect']],
    ['iqtsodchi', ['Economist']],
    ['Ingliz tili ustoziman', ['English Teacher']],
    ['Mobilagraf ITishnik pdf faylla frontet', ['Frontend Developer', 'IT Specialist']],
    ['Farqi yo qande ish bulsa hm, bolalarga qarash menga yoqadi', ['Nanny']],
  ];

  for (const [text, expected] of cases) {
    const labels = matchExtendedProfessions(text, { limit: 8 }).map((match) => match.label);
    for (const label of expected) assert.ok(labels.includes(label), `${text} -> ${labels.join(', ')}`);
  }
});

test('contained generic profession does not duplicate a more specific profession', () => {
  assert.deepEqual(
    matchExtendedProfessions('Главный бухгалтер').map((match) => match.label),
    ['Chief Accountant'],
  );
});

test('source candidate intent covers reversed Slavic word order', () => {
  assert.equal(matchesSourceCandidateIntent('Работу ищу срочно, любую, в Алматы.'), true);
  assert.equal(matchesSourceCandidateIntent('Роботу шукаю терміново'), true);
  assert.equal(matchesSourceCandidateIntent('Вакансия закрыта'), false);
});

test('profession labels preserve punctuation-heavy canonical display names', () => {
  assert.equal(professionDisplayLabel('oil_gas_worker'), 'Oil & Gas Worker');
  assert.equal(professionDisplayLabel('finance_banking_specialist'), 'Finance / Banking Specialist');
  assert.equal(professionDisplayLabel('qa_engineer'), 'QA Engineer');
});
