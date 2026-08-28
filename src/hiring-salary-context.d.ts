export type SalaryCurrencySource = 'explicit' | 'country-default' | 'language-default' | 'unknown';

export interface HiringSalaryContextOptions {
  country?: string | null;
  location?: string | null;
  currencyFallback?: 'country' | 'language';
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
  [key: string]: unknown;
}

export const COUNTRY_DEFAULT_CURRENCIES: Readonly<Record<string, string>>;
export function defaultCurrencyForCountry(value: unknown): string | null;
export function parseHiringSalaryWithContext(
  value: unknown,
  options?: HiringSalaryContextOptions,
): ParsedHiringSalaryWithContext | null;
export function parseHiringVacancySalary(
  value: unknown,
  options?: HiringSalaryContextOptions,
): ParsedHiringSalaryWithContext | null;
