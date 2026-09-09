import type { ParseCandidate } from './parser-core.js';
export type TemporalContext = Readonly<{ domain?: 'real-estate' | 'vacancy'; countryCode?: string; cityId?: string; locale?: string; referenceDate?: Date | string; publishedAt?: Date | string; fetchedAt?: Date | string; source?: string }>;
export type CalendarDateValue = Readonly<{ year: number; month: number; day: number }>;
export type TimeValue = Readonly<{ hour: number; minute: number }>;
export type TimeRangeValue = Readonly<{ start: TimeValue; end: TimeValue; crossesMidnight: boolean }>;
export type DurationValue = Readonly<{ value: number; unit: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'; bound: 'exact' | 'min' | 'max' }>;
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type WorkScheduleValue = Readonly<{
  type: 'cycle' | 'weekdays' | 'custom' | 'flexible';
  workDays?: number;
  restDays?: number;
  cycleHours?: Readonly<{
    work: number;
    rest: number;
  }>;
  daysOffMode?: 'fixed' | 'floating' | 'rotating';
  workingDays?: readonly Weekday[];
  workingHours?: TimeRangeValue;
}>;
export type ShiftValue = Readonly<{ name?: string; hours: TimeRangeValue }>;
export type TemporalData = Readonly<Record<string, CalendarDateValue | DurationValue | TimeValue | TimeRangeValue | WorkScheduleValue | readonly ShiftValue[] | unknown>>;
export function extractTemporalCandidates(value: unknown, context?: TemporalContext): readonly ParseCandidate[];
export function parseTemporal(value: unknown, context?: TemporalContext): Readonly<{ data: TemporalData; confidence: Readonly<Record<string, number>>; debug: Readonly<{ candidates: readonly ParseCandidate[]; discardedCandidates: readonly ParseCandidate[]; refinersApplied: readonly string[] }> }>;
