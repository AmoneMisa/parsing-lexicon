import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCvEmploymentPeriods, parseEmploymentDate, findEmploymentRanges, mergeEmploymentPeriods, totalEmploymentMonths } from '../src/cv-employment.js';
import { extractCvExperienceYears } from '../src/hiring-requirements.js';

const REFERENCE = new Date('2026-08-25T00:00:00Z');
const periodsOf = (text, options) => parseCvEmploymentPeriods(text, { referenceDate: REFERENCE, ...options });

test('a ParsedDate records only the precision the text actually gave', () => {
  assert.deepEqual({ ...parseEmploymentDate('2019') }, { year: 2019, precision: 'year' });
  assert.deepEqual({ ...parseEmploymentDate('2019-03') }, { year: 2019, month: 3, precision: 'month' });
  assert.deepEqual({ ...parseEmploymentDate('03/2019') }, { year: 2019, month: 3, precision: 'month' });
  assert.deepEqual({ ...parseEmploymentDate('March 2019') }, { year: 2019, month: 3, precision: 'month' });
  assert.equal(parseEmploymentDate('not a date'), null);
  assert.equal(parseEmploymentDate(''), null);
});

test('month names parse in every supported language', () => {
  for (const [text, month] of [['март 2019', 3], ['березня 2019', 3], ['mart 2019', 3], ['наурыз 2019', 3], ['martie 2019', 3], ['dekabr 2019', 12], ['желтоқсан 2019', 12]]) {
    assert.equal(parseEmploymentDate(text)?.month, month, `${text} should be month ${month}`);
  }
});

test('a plain year range spans January to December', () => {
  const [range] = findEmploymentRanges('2019 - 2021', { referenceDate: REFERENCE });
  assert.equal(range.durationMonths, 36);
  assert.equal(range.start.precision, 'year');
});

test('an ongoing range ends at the reference date, not at parse time', () => {
  const [range] = findEmploymentRanges('2024-01 - present', { referenceDate: REFERENCE });
  assert.equal(range.ongoing, true);
  assert.deepEqual({ ...range.end }, { year: 2026, month: 8, precision: 'month' });
  assert.equal(range.durationMonths, 32);
});

test('ongoing wording is recognised in every supported language', () => {
  for (const wording of ['present', 'current', 'now', 'по настоящее время', 'наст. время', 'сейчас', 'дотепер', 'зараз', 'hozirgacha', 'ҳозиргача', 'қазірге дейін', 'în prezent', 'prezent']) {
    const [range] = findEmploymentRanges(`2024-01 - ${wording}`, { referenceDate: REFERENCE });
    assert.ok(range?.ongoing, `"${wording}" should mark the period ongoing`);
  }
});

test('multilingual separators join the two ends of a range', () => {
  for (const text of ['2019 - 2021', '2019 – 2021', '2019 — 2021', '2019 to 2021', '2019 по 2021', '2019 до 2021', '2019 gacha 2021', '2019 până 2021']) {
    assert.equal(findEmploymentRanges(text, { referenceDate: REFERENCE }).length, 1, `${text} should be one range`);
  }
});

test('a lone date is not a range', () => {
  assert.deepEqual(findEmploymentRanges('Graduated 2019-03', { referenceDate: REFERENCE }), []);
  assert.deepEqual(findEmploymentRanges('Born in 1990.', { referenceDate: REFERENCE }), []);
});

test('a reversed or absurd range is rejected rather than guessed at', () => {
  assert.deepEqual(findEmploymentRanges('2021 - 2019', { referenceDate: REFERENCE }), []);
  assert.deepEqual(findEmploymentRanges('1900 - 2021', { referenceDate: REFERENCE }), []);
});

test('periods carry company, role, duration and their source range', () => {
  const cv = 'Work Experience\nSenior Backend Engineer, Acme LLC, 2020-01 - 2022-12\nBuilt services with TypeScript and PostgreSQL.\n';
  const [period] = periodsOf(cv);
  assert.equal(period.company, 'Acme LLC');
  assert.equal(period.role, 'Senior Backend Engineer');
  assert.equal(period.durationMonths, 36);
  assert.equal(period.ongoing, false);
  assert.deepEqual([...period.skills].sort(), ['PostgreSQL', 'TypeScript']);
  assert.match(cv.slice(period.sectionRange.start, period.sectionRange.end), /Senior Backend Engineer/);
  assert.match(cv.slice(period.sectionRange.start, period.sectionRange.end), /PostgreSQL/);
});

test('skills attach to the entry that claimed them, not to the whole CV', () => {
  const cv = ['Experience', 'Backend Engineer, Acme LLC, 2020 - 2021', 'Worked with Docker.', 'Frontend Engineer, Globex Ltd, 2022 - 2023', 'Worked with Vue.'].join('\n');
  const periods = periodsOf(cv);
  assert.equal(periods.length, 2);
  assert.deepEqual(periods[0].skills, ['Docker']);
  assert.deepEqual(periods[1].skills, ['Vue']);
});

test('an entry without a recognisable role still keeps its employer', () => {
  const [period] = periodsOf('Experience\nAcme LLC, 2020 - 2021\n');
  assert.equal(period.company, 'Acme LLC');
  assert.equal(period.role, undefined);
});

test('periods are read from the experience and projects sections', () => {
  const cv = ['Profile', 'Engineer since 2010 - 2012 somewhere', 'Experience', 'Acme LLC, 2020 - 2021', 'Projects', 'Side thing, 2022 - 2023'].join('\n');
  const periods = periodsOf(cv);
  assert.equal(periods.length, 2, 'the profile section must not contribute employment');
  assert.deepEqual(periods.map(item => item.start.year), [2020, 2022]);
});

test('a CV with no headings falls back to scanning the whole document', () => {
  const periods = periodsOf('Acme LLC, 2020 - 2021\n');
  assert.equal(periods.length, 1);
  assert.equal(periods[0].company, 'Acme LLC');
});

test('a section scope can be narrowed by the caller', () => {
  const cv = ['Experience', 'Acme LLC, 2020 - 2021', 'Projects', 'Side thing, 2022 - 2023'].join('\n');
  assert.equal(periodsOf(cv, { sections: ['experience'] }).length, 1);
});

test('overlapping periods merge instead of double-counting concurrent jobs', () => {
  const merged = mergeEmploymentPeriods(periodsOf('Experience\nAcme LLC, 2020-01 - 2021-12\nGlobex Ltd, 2021-01 - 2022-12\n'));
  assert.equal(merged.length, 1);
  assert.equal(merged[0].durationMonths, 36, '2020-01 through 2022-12 is 36 months, not 48');
  assert.deepEqual([...merged[0].companies].sort(), ['Acme LLC', 'Globex Ltd']);
});

test('adjacent periods merge and a real gap stays a gap', () => {
  assert.equal(totalEmploymentMonths(periodsOf('Experience\nA Ltd, 2020-01 - 2020-12\nB Ltd, 2021-01 - 2021-12\n')), 24);
  const gapped = mergeEmploymentPeriods(periodsOf('Experience\nA Ltd, 2018-01 - 2018-12\nB Ltd, 2021-01 - 2021-12\n'));
  assert.equal(gapped.length, 2, 'a two-year gap must not be merged away');
  assert.equal(gapped.reduce((sum, entry) => sum + entry.durationMonths, 0), 24);
});

test('empty and heading-only input produce no periods', () => {
  assert.deepEqual(periodsOf(''), []);
  assert.deepEqual(periodsOf(null), []);
  assert.deepEqual(periodsOf('Experience\n'), []);
  assert.equal(totalEmploymentMonths([]), 0);
});

test('a two-digit end month is not truncated to its first digit', () => {
  // Regression: both the old inline regex and the first draft of DATE_SRC
  // matched "2021-12" as "2021-1", quietly dropping 11 months from every
  // period that ended in October, November or December.
  const [period] = periodsOf('Experience\nAcme LLC, 2020-01 - 2021-12\n');
  assert.deepEqual({ ...period.end }, { year: 2021, month: 12, precision: 'month' });
  assert.equal(period.durationMonths, 24);
});

test('the legacy experience-years helper counts full end months', () => {
  // This CV is 36 months (2020-01..2022-12) plus 44 (2023-01..2026-08) = 80
  // months = 6.7 years. The previously asserted 5.8 was the truncation bug
  // above: it read the first period as ending 2022-01 and lost 11 months.
  const cv = 'Profile\nFrontend developer\nWork Experience\n2020-01 - 2022-12 Company A\n2023-01 - present Company B\nSkills\nVue, TypeScript';
  assert.equal(extractCvExperienceYears(cv, REFERENCE), 6.7);
});

test('the legacy helper now also reads multilingual employment rows', () => {
  const cv = 'Опыт работы\nРазработчик, ООО Акме, март 2020 - декабрь 2022\n';
  assert.equal(extractCvExperienceYears(cv, REFERENCE), 2.8, 'March 2020 through December 2022 is 34 months');
});

test('explicit prose experience still wins when it claims more', () => {
  assert.equal(extractCvExperienceYears('Professional summary: over 5 years of commercial experience.'), 5);
});
