import type { ParseCandidate } from './parser-core.js';
export type TemporalContext = Readonly<{ domain?: 'real-estate' | 'vacancy'; countryCode?: string; cityId?: string; locale?: string; referenceDate?: Date | string; publishedAt?: Date | string; fetchedAt?: Date | string; source?: string }>;
export type CalendarDateValue = Readonly<{ year: number; month: number; day: number }>;
export type TimeValue = Readonly<{ hour: number; minute: number }>;
export type DurationValue = Readonly<{ value: number; unit: 'hour' | 'day' | 'week' | 'month' | 'year'; bound: 'exact' | 'min' | 'max' }>;
export function extractTemporalCandidates(value: unknown, context?: TemporalContext): readonly ParseCandidate[];
export function parseTemporal(value: unknown, context?: TemporalContext): Readonly<{ data: Readonly<Record<string, CalendarDateValue | DurationValue | TimeValue | unknown>>; confidence: Readonly<Record<string, number>>; debug: Readonly<{ candidates: readonly ParseCandidate[]; discardedCandidates: readonly ParseCandidate[]; refinersApplied: readonly string[] }> }>;
