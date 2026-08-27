import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSalary, salaryPeriod } from '../src/money.js';

test('parses leaked jobs.per* salary period markers', () => {
  const cases = [
    ['$110K/jobs.perProject', 'project', 110_000],
    ['$208K/jobs.perWeek', 'week', 208_000],
    ['$149K/jobs.perShift', 'shift', 149_000],
    ['$341K/jobs.perDay', 'day', 341_000],
    ['$55/jobs.perHour', 'hour', 55],
    ['$9K/jobs.perMonth', 'month', 9_000],
    ['$120K/jobs.perYear', 'year', 120_000],
    ['$10/jobs.perPiece', 'piece', 10],
  ];

  for (const [source, period, amount] of cases) {
    assert.equal(salaryPeriod(source), period, source);
    const parsed = parseSalary(source);
    assert.ok(parsed, source);
    assert.equal(parsed.period, period, source);
    assert.equal(parsed.min, amount, source);
    assert.equal(parsed.max, amount, source);
    assert.equal(parsed.currency, 'USD', source);
  }
});

test('parses an estimated hourly USD range with a unicode dash', () => {
  const parsed = parseSalary('Estimated Hourly Pay Range $55 — $65 USD Verkada');
  assert.ok(parsed);
  assert.equal(parsed.period, 'hour');
  assert.equal(parsed.currency, 'USD');
  assert.equal(parsed.min, 55);
  assert.equal(parsed.max, 65);
});
