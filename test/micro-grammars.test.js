import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMicroGrammarCandidates, microGrammarParser } from '../src/micro-grammars.js';
import { runCandidatePipeline } from '../src/parser-core.js';

const housing = (text) => extractMicroGrammarCandidates(text, { domain: 'housing' });
const jobs = (text) => extractMicroGrammarCandidates(text, { domain: 'jobs' });
const one = (list, entityType) => list.find((item) => item.entityType === entityType);
const valueOf = (list, entityType) => one(list, entityType)?.value;

test('a floor fraction is read from both slash directions', () => {
  assert.deepEqual({ ...valueOf(housing('этаж 3/9'), 'floorFraction') }, { floor: 3, totalFloors: 9 });
  assert.deepEqual({ ...valueOf(housing('5\\12 этаж'), 'floorFraction') }, { floor: 5, totalFloors: 12 });
});

test('a floor above the building height is rejected', () => {
  assert.equal(one(housing('9/3'), 'floorFraction'), undefined, 'floor 9 of a 3-storey building is not a floor fraction');
});

test('an area triple is read with its three parts', () => {
  assert.deepEqual({ ...valueOf(housing('42/28/8 м²'), 'areaBreakdown') }, { totalSqm: 42, livingSqm: 28, kitchenSqm: 8 });
  assert.deepEqual({ ...valueOf(housing('60/35/10 m2'), 'areaBreakdown') }, { totalSqm: 60, livingSqm: 35, kitchenSqm: 10 });
});

test('an area triple wins the span over a floor fraction inside it', () => {
  const found = housing('42/28/8 м²');
  assert.ok(one(found, 'areaBreakdown'));
  assert.equal(one(found, 'floorFraction'), undefined, 'the longer reading claims the span');
});

test('an incoherent area triple is rejected', () => {
  assert.equal(one(housing('42/50/8 м²'), 'areaBreakdown'), undefined, 'living area cannot exceed total');
});

test('room counts are read in every supported shorthand', () => {
  for (const [text, rooms] of [['2к', 2], ['2-комн', 2], ['3 комнатная', 3], ['2 xona', 2], ['2 хонали', 2], ['3-кімнатна', 3], ['2 camere', 2]]) {
    assert.equal(valueOf(housing(text), 'rooms')?.rooms, rooms, text);
  }
});

test('commission is read as a percentage', () => {
  assert.deepEqual({ ...valueOf(housing('комиссия 50%'), 'commission') }, { percent: 50, charged: true });
  assert.deepEqual({ ...valueOf(housing('риелтор 30 %'), 'commission') }, { percent: 30, charged: true });
});

test('no commission is an explicit zero, not a missing value', () => {
  for (const text of ['без комиссии', 'no commission', 'komissiyasiz']) {
    assert.deepEqual({ ...valueOf(housing(text), 'commission') }, { percent: 0, charged: false }, text);
  }
});

test('a day shift pattern is read for jobs', () => {
  assert.deepEqual({ ...valueOf(jobs('график 2/2'), 'workSchedule') }, { onDays: 2, offDays: 2, kind: 'day-cycle' });
  assert.deepEqual({ ...valueOf(jobs('5/2'), 'workSchedule') }, { onDays: 5, offDays: 2, kind: 'day-cycle' });
});

test('an hour cycle is not mistaken for a day pattern', () => {
  assert.deepEqual({ ...valueOf(jobs('сутки 24/48'), 'workSchedule') }, { onHours: 24, offHours: 48, kind: 'hour-cycle' });
  assert.deepEqual({ ...valueOf(jobs('12/24'), 'workSchedule') }, { onHours: 12, offHours: 24, kind: 'hour-cycle' });
});

test('a rate range is read with currency and period', () => {
  assert.deepEqual({ ...valueOf(jobs('$20–30/h'), 'rateRange') }, { min: 20, max: 30, currency: 'USD', period: 'hour' });
  assert.deepEqual({ ...valueOf(jobs('20-30 € per hour'), 'rateRange') }, { min: 20, max: 30, currency: 'EUR', period: 'hour' });
  assert.deepEqual({ ...valueOf(jobs('500-700 в месяц'), 'rateRange') }, { min: 500, max: 700, currency: null, period: 'month' });
});

test('a reversed rate range is rejected', () => {
  assert.equal(one(jobs('$30-20/h'), 'rateRange'), undefined);
});

test('a minimum experience claim is read', () => {
  assert.deepEqual({ ...valueOf(jobs('3+ years'), 'experienceYears') }, { minYears: 3 });
  assert.deepEqual({ ...valueOf(jobs('5+ лет'), 'experienceYears') }, { minYears: 5 });
  assert.deepEqual({ ...valueOf(jobs('2+ yil'), 'experienceYears') }, { minYears: 2 });
});

test('a language level floor is read', () => {
  assert.deepEqual({ ...valueOf(jobs('B2+'), 'languageLevel') }, { level: 'B2', orHigher: true });
  assert.deepEqual({ ...valueOf(jobs('c1+ English'), 'languageLevel') }, { level: 'C1', orHigher: true });
});

test('an ambiguous slash pair emits both readings when no domain is given', () => {
  const found = extractMicroGrammarCandidates('2/2');
  assert.ok(one(found, 'floorFraction'), 'housing reading present');
  assert.ok(one(found, 'workSchedule'), 'jobs reading present');
});

test('a domain suppresses the reading that cannot apply', () => {
  assert.equal(one(housing('2/2'), 'workSchedule'), undefined);
  assert.equal(one(jobs('2/2'), 'floorFraction'), undefined);
  assert.equal(one(jobs('комиссия 50%'), 'commission'), undefined, 'commission is a housing concept');
  assert.equal(one(housing('3+ years'), 'experienceYears'), undefined);
});

test('candidates carry offsets into the original text', () => {
  const text = 'квартира, этаж 3/9, комиссия 50%';
  for (const item of housing(text)) {
    assert.equal(text.slice(item.start, item.end), item.raw);
  }
});

test('candidates carry typed evidence and build a ledger', () => {
  const [item] = housing('2к');
  assert.ok(item.ledger.score > 0);
  assert.equal(item.ledger.occurrences[0].dimension, 'lexical');
});

test('the grammars run inside the existing pipeline', () => {
  const output = runCandidatePipeline('этаж 3/9', { parsers: [microGrammarParser], context: { domain: 'housing' } });
  assert.equal(output.data.length, 1);
  assert.equal(output.data[0].entityType, 'floorFraction');
});

test('prose without shorthand produces nothing', () => {
  assert.deepEqual(extractMicroGrammarCandidates('a perfectly ordinary sentence'), []);
  assert.deepEqual(extractMicroGrammarCandidates(''), []);
  assert.deepEqual(extractMicroGrammarCandidates(null), []);
});

test('a date or price is not misread as a slash pair', () => {
  assert.equal(one(housing('цена 1000,50'), 'floorFraction'), undefined);
  assert.equal(one(housing('скидка 3/9%'), 'floorFraction'), undefined, 'a percentage is not a floor fraction');
});
