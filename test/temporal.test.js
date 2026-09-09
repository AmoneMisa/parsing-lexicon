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
  assert.deepEqual(parsed.data.workSchedule, { type: 'cycle', workDays: 2, restDays: 2, daysOffMode: 'floating', workingHours: { start: { hour: 7, minute: 0 }, end: { hour: 19, minute: 0 }, crossesMidnight: false } });
  assert.ok(parsed.debug.candidates.some((item) => item.evidence.some((evidence) => evidence.type === 'days-off-mode' && evidence.value === 'floating')));
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

test('temporal API keeps rental duration bounds semantic and recognises priority-country availability language', () => {
  const bounded = parseTemporal('Квартира сдаётся до 6 месяцев. Аренда на год.', {
    domain: 'real-estate', referenceDate: '2026-01-10T12:00:00Z',
  });
  assert.deepEqual(bounded.data.maximumRentalDuration, { value: 6, unit: 'month', bound: 'max' });
  assert.deepEqual(bounded.data.fixedRentalDuration, { value: 1, unit: 'year', bound: 'exact' });

  const ukrainian = parseTemporal('Квартира вільна з 12 лютого, до кінця березня', {
    domain: 'real-estate', referenceDate: '2026-01-10T12:00:00Z',
  });
  assert.deepEqual(ukrainian.data.availabilityDate, { year: 2026, month: 2, day: 12 });
  assert.deepEqual(ukrainian.data.availabilityUntil, { year: 2026, month: 3, day: 31 });

  const romanian = parseTemporal('Disponibilă din 12 februarie până la sfârșitul lunii martie', {
    domain: 'real-estate', referenceDate: '2026-01-10T12:00:00Z',
  });
  assert.deepEqual(romanian.data.availabilityDate, { year: 2026, month: 2, day: 12 });
  assert.deepEqual(romanian.data.availabilityUntil, { year: 2026, month: 3, day: 31 });
});

test('temporal API requires context for ambiguous clocks and schedule cycles', () => {
  assert.equal(parseTemporal('Цена 7.00').data.clockTime, undefined);
  assert.equal(parseTemporal('Планировка 2/2').data.workSchedule, undefined);

  assert.deepEqual(parseTemporal('График 24/48, смены', { domain: 'vacancy' }).data.workSchedule, {
    type: 'cycle', cycleHours: { work: 24, rest: 48 }, daysOffMode: 'rotating',
  });
  assert.equal(parseTemporal('Планировка 24/48').data.workSchedule, undefined);

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

test('temporal API keeps one shared engine while accepting priority-country schedule and duration vocabulary', () => {
  const uz = parseTemporal('Ish grafigi dushanba-juma 09:00-18:00. Kvartira kamida 3 oyga ijaraga beriladi.', {
    domain: 'real-estate',
  });

  assert.equal(parseTemporal('Скользящий график 2/2').data.workSchedule.daysOffMode, 'rotating');
  assert.deepEqual(uz.data.workSchedule.workingDays, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  assert.deepEqual(uz.data.minimumRentalDuration, { value: 3, unit: 'month', bound: 'min' });

  const ro = parseTemporal('Program de lucru luni-vineri 09:00-18:00. Contract pe o perioadă de 1 an.', {
    domain: 'vacancy',
  });
  assert.deepEqual(ro.data.workSchedule.workingDays, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  assert.deepEqual(ro.data.contractDuration, { value: 1, unit: 'year', bound: 'exact' });

  const uk = parseTemporal('Графік роботи понеділок-п’ятниця 9 ранку-6 вечора');
  assert.deepEqual(uk.data.workSchedule.workingDays, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  assert.deepEqual(uk.data.timeRange, { start: { hour: 9, minute: 0 }, end: { hour: 18, minute: 0 }, crossesMidnight: false });

  for (const value of ['Жұмыс кестесі дүйсенбі-жұма 09:00-18:00', 'Жумуш графиги дүйшөмбү-жума 09:00-18:00']) {
    assert.deepEqual(parseTemporal(value).data.workSchedule.workingDays, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  }
});

test('temporal API resolves numbered relative availability dates in priority-country language', () => {
  const context = { domain: 'real-estate', referenceDate: '2026-09-09T12:00:00Z' };
  assert.deepEqual(parseTemporal('Квартира доступна через 3 дні', context).data.availabilityDate, { year: 2026, month: 9, day: 12 });
  assert.deepEqual(parseTemporal('Disponibilă peste 2 zile', context).data.availabilityDate, { year: 2026, month: 9, day: 11 });
  assert.deepEqual(parseTemporal('Пәтер 4 күннен кейін бос', context).data.availabilityDate, { year: 2026, month: 9, day: 13 });
});
