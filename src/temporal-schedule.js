import { DAY_ALIASES, DAY_PATTERN, WEEKDAYS } from './temporal-weekday.js';
import { candidate } from './temporal-shared.js';

/**
 * ScheduleCycleParser + WeekdayParser + multiple-shifts: work-schedule
 * cycles ("2/2", "два через два"), fixed weekday ranges ("Пн-Пт"), named
 * weekday sets ("по будням"/"только по выходным"), and multi-shift
 * listings ("1 смена 07:00-15:00 ... 2 смена ..."). A bare "N/M" ratio is
 * only read as a schedule when SCHEDULE_CONTEXT_RE finds nearby work-
 * schedule language — otherwise it stays ambiguous (never assumed to be a
 * schedule by default).
 */

export const SCHEDULE_CONTEXT_RE = /(?:график|смен[аы]|режим\s+работы|work\s*schedule|shift|работ[аы]|job|графік|змін[аи]|program(?:ul)?\s+de\s+lucru|ish\s+grafigi|жұмыс\s+кестесі|жумуш\s+графиги)/iu;
const WEEKDAY_RANGE_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${DAY_PATTERN})\\s*(?:-|–|—|до|to|по)\\s*(${DAY_PATTERN})(?![\\p{L}\\p{N}])`, 'giu');
const SHIFT_RE = /(?<!\d)(\d{1,2})\s*(?:смен[аы]|shift)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm|утра|вечера)?)\s*(?:-|–|—|до|to)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm|утра|вечера)?)/giu;

function scheduleDaysOffMode(text) {
  if (/(?:плавающ|floating|flexible\s+days\s+off)/iu.test(text)) return 'floating';
  if (/(?:скользящ|сменн|rotating\s+days\s+off|выходные\s+по\s+графику)/iu.test(text)) return 'rotating';
  return 'fixed';
}
function cycleScheduleValue(work, rest, daysOffMode) {
  // Day cycles such as 2/2 and 5/2 are common. Values larger than a week in
  // an explicit schedule context are the conventional shift notation 24/48
  // or 12/24, not a claim of dozens of working days.
  if (Math.max(work, rest) > 7) {
    // An hour cycle has no fixed weekday rest days. Keep an explicitly
    // floating mode, otherwise expose the inherent repeating rotation.
    return Object.freeze({ type: 'cycle', cycleHours: Object.freeze({ work, rest }), daysOffMode: daysOffMode === 'fixed' ? 'rotating' : daysOffMode });
  }
  return Object.freeze({ type: 'cycle', workDays: work, restDays: rest, daysOffMode });
}

export function extractScheduleCandidates(text, parseClock) {
  const candidates = [];
  const scheduleContext = SCHEDULE_CONTEXT_RE;
  for (const match of text.matchAll(/(?<![\d:.])(\d{1,2})\s*(?:\/|\\|через|-)\s*(\d{1,2})(?![\d:.])/giu)) {
    const around = text.slice(Math.max(0, (match.index ?? 0) - 32), (match.index ?? 0) + match[0].length + 32); if (!scheduleContext.test(around)) continue;
    const daysOffMode = scheduleDaysOffMode(around);
    const work = Number(match[1]); const rest = Number(match[2]);
    candidates.push(candidate('workSchedule', cycleScheduleValue(work, rest, daysOffMode), match, 'temporal.schedule-cycle', .99, [{ type: 'context', value: 'schedule' }, { type: 'range', value: Math.max(work, rest) > 7 ? 'cycle-hours' : 'cycle' }, { type: 'days-off-mode', value: daysOffMode }]));
  }
  for (const match of text.matchAll(/(?<![\p{L}\p{N}])два\s+через\s+два(?![\p{L}\p{N}])/giu)) {
    const around = text.slice(Math.max(0, (match.index ?? 0) - 32), (match.index ?? 0) + match[0].length + 32); if (!scheduleContext.test(around)) continue;
    const daysOffMode = scheduleDaysOffMode(around);
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'cycle', workDays: 2, restDays: 2, daysOffMode }), match, 'temporal.schedule-cycle.words', .97, [{ type: 'context', value: 'schedule' }, { type: 'range', value: 'cycle' }, { type: 'days-off-mode', value: daysOffMode }]));
  }
  for (const match of text.matchAll(WEEKDAY_RANGE_RE)) {
    const start = DAY_ALIASES[match[1].toLowerCase()]; const end = DAY_ALIASES[match[2].toLowerCase()];
    if (start == null || end == null || end < start) continue;
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'weekdays', workingDays: WEEKDAYS.slice(start, end + 1), daysOffMode: 'fixed' }), match, 'temporal.schedule-weekdays', .97, [{ type: 'range', value: 'weekday' }]));
  }
  for (const match of text.matchAll(/(?<![\p{L}\p{N}])(?:по\s+будням|weekdays?)(?![\p{L}\p{N}])/giu)) {
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'weekdays', workingDays: WEEKDAYS.slice(0, 5), daysOffMode: 'fixed' }), match, 'temporal.schedule-weekdays.named', .96, [{ type: 'context', value: 'weekdays' }]));
  }
  for (const match of text.matchAll(/(?<![\p{L}\p{N}])(?:только\s+по\s+выходным|weekends?\s+only)(?![\p{L}\p{N}])/giu)) {
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'weekdays', workingDays: WEEKDAYS.slice(5), daysOffMode: 'fixed' }), match, 'temporal.schedule-weekends', .96, [{ type: 'context', value: 'weekends' }]));
  }
  const shifts = [];
  let firstShift = null; let lastShift = null;
  for (const match of text.matchAll(SHIFT_RE)) { const start = parseClock(match[2]); const end = parseClock(match[3]); if (!start || !end) continue; firstShift ||= match; lastShift = match; shifts.push(Object.freeze({ name: `${match[1]} shift`, hours: Object.freeze({ start, end, crossesMidnight: start.hour * 60 + start.minute > end.hour * 60 + end.minute }) })); }
  if (shifts.length) candidates.push(candidate('shifts', Object.freeze(shifts), { 0: text.slice(firstShift.index, (lastShift.index ?? 0) + lastShift[0].length), index: firstShift.index }, 'temporal.multiple-shifts', .98, [{ type: 'context', value: 'shift' }, { type: 'range', value: 'clock-time' }]));
  return candidates;
}
