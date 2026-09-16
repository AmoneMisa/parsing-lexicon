import type { CvSection } from './cv-sections.js';

/** Precision records what the text said. A bare "2019" is year precision; the
 * month is absent rather than guessed. */
export type ParsedDate = Readonly<{ year: number; month?: number; precision: 'year' | 'month' }>;

export type EmploymentRange = Readonly<{
  start: ParsedDate;
  end: ParsedDate;
  ongoing: boolean;
  startIndex: number;
  endIndex: number;
  durationMonths: number;
  raw: string;
  range: Readonly<{ start: number; end: number }>;
}>;

export type EmploymentPeriod = Readonly<{
  company?: string;
  role?: string;
  start: ParsedDate;
  end: ParsedDate;
  ongoing: boolean;
  durationMonths: number;
  sectionRange: Readonly<{ start: number; end: number }>;
  skills: readonly string[];
  startIndex: number;
  endIndex: number;
}>;

export type MergedEmploymentPeriod = Readonly<{
  startIndex: number;
  endIndex: number;
  ongoing: boolean;
  durationMonths: number;
  companies: readonly string[];
}>;

export type EmploymentOptions = { referenceDate?: Date; sections?: readonly CvSection[] };

export function parseEmploymentDate(value: unknown): ParsedDate | null;
export function findEmploymentRanges(value: unknown, options?: EmploymentOptions): readonly EmploymentRange[];
export function parseCvEmploymentPeriods(value: unknown, options?: EmploymentOptions): readonly EmploymentPeriod[];
export function mergeEmploymentPeriods(periods: readonly EmploymentPeriod[]): readonly MergedEmploymentPeriod[];
export function totalEmploymentMonths(periods: readonly EmploymentPeriod[]): number;
