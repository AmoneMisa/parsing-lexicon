export const MONEY_NUMBER_PATTERN: string;
export const MONEY_SCALE_PATTERN: string;
export const MONEY_RANGE_RE: RegExp;
export const MONEY_SINGLE_RE: RegExp;
export function parseNumericAmount(raw: unknown): number | null;
export function moneyScaleMultiplier(raw: unknown): number;
export function parseScaledAmount(raw: unknown, scale?: unknown): number | null;
export function moneyCurrencyFromText(value: unknown, fallbackCurrency?: string | null): string | null;
export function moneyCurrencyPattern(): string;
