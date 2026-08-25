import assert from 'node:assert/strict';
import test from 'node:test';

import {
  detectRecruitmentAgency,
  detectUsLocation,
  detectVisaSponsorshipWording,
  extractCandidateDisplayName,
  extractCandidateExperienceMentions,
  extractCandidateStructuredField,
  extractJobStructuredField,
  extractNiceToHaveContext,
  parseCandidateSalary,
  parseHiringSourceSalary,
} from '../src/hiring-source-semantics.js';

test('structured source fields reuse shared field dictionaries', () => {
  assert.equal(extractCandidateStructuredField('Narxi: 6 mln', 'salary'), '6 mln');
  assert.equal(extractCandidateStructuredField("Ma'lumoti: Oliy", 'education'), 'Oliy');
  assert.equal(extractJobStructuredField('Company: Acme', 'company'), 'Acme');
  assert.equal(extractJobStructuredField('Locație: București', 'location'), 'București');
});

test('candidate fallback identity and experience cover legacy CV formats', () => {
  assert.equal(extractCandidateDisplayName('Resume | Maria Ivanova\nFrontend Developer'), 'Maria Ivanova');
  assert.equal(extractCandidateDisplayName('Вітаю, мене звати Олена\nШукаю роботу'), 'Олена');
  assert.deepEqual(
    extractCandidateExperienceMentions('Experience: 2 months backend developer\n3 years frontend developer experience'),
    [
      { years: 0.2, context: 'Experience: 2 months backend developer' },
      { years: 3, context: '3 years frontend developer experience' },
    ],
  );
  assert.deepEqual(
    extractCandidateExperienceMentions('3 yilga yaqin tajriba frontend dasturchi sifatida'),
    [{ years: 3, context: '3 yilga yaqin tajriba' }],
  );
});

test('source salary parser covers external-board currency and multiplier variants', () => {
  const jooble = parseHiringSourceSalary('від 6кк до 10кк сум');
  assert.equal(jooble?.min, 6_000_000);
  assert.equal(jooble?.max, 10_000_000);
  assert.equal(jooble?.currency, 'UZS');

  const somoni = parseHiringSourceSalary('5000 - 7000 TJS');
  assert.equal(somoni?.min, 5000);
  assert.equal(somoni?.max, 7000);
  assert.equal(somoni?.currency, 'TJS');

  const candidate = parseCandidateSalary('Narxi: 500+', 'UZ');
  assert.equal(candidate?.min, 500);
  assert.equal(candidate?.currency, 'UZS');
});

test('vacancy source semantics centralize US, sponsorship, agency and nice-to-have wording', () => {
  assert.equal(detectUsLocation('San Mateo, CA'), true);
  assert.equal(detectUsLocation('Toronto, Canada'), false);
  assert.equal(detectVisaSponsorshipWording('We can sponsor qualified candidates.'), 'offered');
  assert.equal(detectVisaSponsorshipWording('Must be authorized to work without future sponsorship.'), 'notOffered');
  assert.equal(detectRecruitmentAgency('International staffing agency'), true);
  assert.match(extractNiceToHaveContext('Requirements. Nice to have: Vue, GraphQL. Benefits.'), /Vue, GraphQL/);
});
