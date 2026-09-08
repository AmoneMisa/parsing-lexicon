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
  assert.deepEqual(parsed.data.workSchedule, { type: 'cycle', workDays: 2, restDays: 2, daysOffMode: 'rotating', workingHours: { start: { hour: 7, minute: 0 }, end: { hour: 19, minute: 0 }, crossesMidnight: false } });
  assert.deepEqual(parsed.data.timeRange, { start: { hour: 7, minute: 0 }, end: { hour: 19, minute: 0 }, crossesMidnight: false });
  assert.equal(parseTemporal('Планировка 2/2').data.workSchedule, undefined);
  assert.equal(parseTemporal('Смена 22:00-06:00').data.timeRange.crossesMidnight, true);
});

test('temporal API resolves relative availability, weekdays, and multiple shifts', () => {
  const availability = parseTemporal('Можно заезжать с завтра', { domain: 'real-estate', referenceDate: '2026-09-07T12:00:00Z' });
  assert.deepEqual(availability.data.availabilityDate, { year: 2026, month: 9, day: 8 });
  const schedule = parseTemporal('Пн-Пт 09:00-18:00');
  assert.deepEqual(schedule.data.workSchedule.workingDays, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  assert.equal(schedule.data.workSchedule.workingHours.end.hour, 18);
  const shifts = parseTemporal('1 смена 07:00-15:00; 2 смена 15:00-23:00; 3 смена 23:00-07:00');
  assert.equal(shifts.data.shifts.length, 3);
  assert.equal(shifts.data.shifts[2].hours.crossesMidnight, true);
});

test('temporal API classifies compact rental, vacancy, and calendar-boundary terms', () => {
  const rental = parseTemporal('Квартира от 3х мес. сдаётся. Доступна до конца февраля', {
    domain: 'real-estate', referenceDate: '2026-01-10T12:00:00Z',
  });
  assert.deepEqual(rental.data.minimumRentalDuration, { value: 3, unit: 'month', bound: 'min' });
  assert.deepEqual(rental.data.availabilityUntil, { year: 2026, month: 2, day: 28 });

  const vacancy = parseTemporal('Испытательный срок 3 месяца. Контракт на год. Выход через две недели.', {
    domain: 'vacancy', referenceDate: '2026-09-07T12:00:00Z',
  });
  assert.deepEqual(vacancy.data.probationDuration, { value: 3, unit: 'month', bound: 'exact' });
  assert.deepEqual(vacancy.data.contractDuration, { value: 1, unit: 'year', bound: 'exact' });
  assert.deepEqual(vacancy.data.startDate, { year: 2026, month: 9, day: 21 });
});

test('temporal API requires context for ambiguous clocks and schedule cycles', () => {
  assert.equal(parseTemporal('Цена 7.00').data.clockTime, undefined);
  assert.equal(parseTemporal('Планировка 2/2').data.workSchedule, undefined);

  const schedule = parseTemporal('Работа 2 через 2, ночные смены 19:00-07:00', { domain: 'vacancy' });
  assert.deepEqual(schedule.data.workSchedule, {
    type: 'cycle', workDays: 2, restDays: 2, daysOffMode: 'fixed', workingHours: {
      start: { hour: 19, minute: 0 }, end: { hour: 7, minute: 0 }, crossesMidnight: true,
    },
  });

  const evening = parseTemporal('Встреча в 7 вечера');
  assert.deepEqual(evening.data.clockTime, { hour: 19, minute: 0 });

  const weekdays = parseTemporal('Вт-Сб 09:00-18:00');
  assert.deepEqual(weekdays.data.workSchedule.workingDays, ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
});

test('temporal API supports contextual partial and month-first calendar dates', () => {
  const partial = parseTemporal('Дедлайн: 12.01', { domain: 'vacancy', referenceDate: '2026-01-10T12:00:00Z' });
  assert.deepEqual(partial.data.deadline, { year: 2026, month: 1, day: 12 });
  const monthFirst = parseTemporal('Available from January 12', { domain: 'real-estate', publishedAt: '2026-12-20T12:00:00Z' });
  assert.deepEqual(monthFirst.data.availabilityDate, { year: 2027, month: 1, day: 12 });

  const nextMonday = parseTemporal('Можно заезжать со следующего понедельника', { domain: 'real-estate', referenceDate: '2026-09-09T12:00:00Z' });
  assert.deepEqual(nextMonday.data.availabilityDate, { year: 2026, month: 9, day: 14 });
});
