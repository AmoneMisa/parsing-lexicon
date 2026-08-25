export const HIRING_MONTHS: Readonly<Record<string, number>>;
export const UNICODE_LEFT_BOUNDARY: string;
export const UNICODE_RIGHT_BOUNDARY: string;
export const TODAY_RE: RegExp;
export const YESTERDAY_RE: RegExp;
export const HOURS_AGO_RE: RegExp;
export const DAYS_AGO_RE: RegExp;
export const AGO_SUFFIX: string;
export const WEEKS_AGO_RE: RegExp;
export const MONTHS_AGO_RE: RegExp;
export const YEARS_AGO_RE: RegExp;

export function parseHiringActivityDate(value: unknown, now?: Date): string | null;
export function parseHiringDayMonthDate(value: unknown, now?: Date): string | null;
export function extractHiringDeadline(value: unknown): string | null;
