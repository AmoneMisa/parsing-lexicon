export type CurrencyDisplay = Readonly<{
  code: string;
  symbol: string;
  name: string;
}>;

export const CURRENCY_TERMS: readonly import('../index.d.ts').LexiconEntity[];
export const CURRENCY_SYMBOL_CANDIDATES: Readonly<Record<string, readonly string[]>>;
export function moneyCurrencyCandidatesFromText(value: unknown): readonly string[];
export function moneyCurrencyFromText(value: unknown, fallbackCurrency?: string | null): string | null;
export function moneyCurrencyPattern(): string;
export function currencyDisplay(code: unknown, locale?: string): CurrencyDisplay | null;
export function currencySymbol(code: unknown, locale?: string): string | null;
export function currencyName(code: unknown, locale?: string): string | null;
