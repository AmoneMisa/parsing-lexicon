export type SalaryCurrencySource = 'explicit' | 'country-default' | 'language-default' | 'unknown';
export type SalaryPeriodSource = 'explicit' | 'country-default' | 'unknown';

export interface HiringSalaryContextOptions {
  country?: string | null;
  location?: string | null;
  currencyFallback?: 'country' | 'language';
  periodFallback?: 'country';
}

export interface ParsedHiringSalaryWithContext {
  min: number | null;
  max: number | null;
  currency: string | null;
  period: string | null;
  negotiable: boolean;
  gross: boolean | null;
  approximate: boolean;
  currencySource: SalaryCurrencySource;
  currencyCountry: string | null;
  periodSource: SalaryPeriodSource;
  periodCountry: string | null;
  [key: string]: unknown;
}

export const COUNTRY_DEFAULT_CURRENCIES: Readonly<Record<string, string>>;
export const COUNTRY_DEFAULT_SALARY_PERIODS: Readonly<Record<string, string>>;
export function defaultCurrencyForCountry(value: unknown): string | null;
export function defaultSalaryPeriodForCountry(value: unknown): string | null;
export function parseHiringSalaryWithContext(
  value: unknown,
  options?: HiringSalaryContextOptions,
): ParsedHiringSalaryWithContext | null;
export function parseHiringVacancySalary(
  value: unknown,
  options?: HiringSalaryContextOptions,
): ParsedHiringSalaryWithContext | null;
