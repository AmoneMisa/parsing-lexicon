import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTemporal } from '../src/temporal.js';

test('temporal API preserves inferred availability dates and rental duration evidence', () => {
  const parsed = parseTemporal('Квартира свободна с 12 января, сдаётся минимум на 3 месяца', { domain: 'real-estate', publishedAt: '2026-12-20T12:00:00Z' });
  assert.deepEqual(parsed.data.availabilityDate, { year: 2027, month: 1, day: 12 });
  assert.deepEqual(parsed.data.minimumRentalDuration, { value: 3, unit: 'month', bound: 'min' });
  assert.ok(parsed.debug.candidates.find((item) => item.entityType === 'availabilityDate').evidence.some((item) => item.type === 'inferred-year'));
});

test('temporal API resolves contextual schedules and overnight ranges without treating bare ratios as schedules', () => {
  const parsed = parseTemporal('График работы 2/2, выходные плавающие, с 07.00 до 19.00', { domain: 'vacancy' });
  assert.deepEqual(parsed.data.workSchedule, { type: 'cycle', workDays: 2, restDays: 2, daysOffMode: 'rotating' });
  assert.deepEqual(parsed.data.timeRange, { start: { hour: 7, minute: 0 }, end: { hour: 19, minute: 0 }, crossesMidnight: false });
  assert.equal(parseTemporal('Планировка 2/2').data.workSchedule, undefined);
  assert.equal(parseTemporal('Смена 22:00-06:00').data.timeRange.crossesMidnight, true);
});
