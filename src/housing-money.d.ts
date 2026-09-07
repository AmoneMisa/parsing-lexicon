export type HousingPriceParseResult = Readonly<{
  amount: number | null;
  currency: string;
  approximate: boolean;
}>;

export type HousingMoneyParseContext = Readonly<{
  country?: string;
  currency?: string;
  fallbackCurrency?: string;
  dealType?: 'sale' | 'longRent' | 'shortRent' | string | null;
}>;
export type HousingMoneyCandidate = Readonly<{ amount: number; currency: string; start: number; end: number; explicitCurrency: boolean; scale: string | null; priceKeyword: boolean; paymentRole: string; approximate: boolean; confidence: number }>;
export function extractHousingMoneyCandidates(value: unknown, context?: string | HousingMoneyParseContext): readonly HousingMoneyCandidate[];
export function rankHousingPriceCandidates(candidates: readonly HousingMoneyCandidate[]): readonly HousingMoneyCandidate[];

export function parseHousingPrice(
  value: unknown,
  context?: string | HousingMoneyParseContext,
): HousingPriceParseResult;
export function parseHousingPricePerSqm(
  value: unknown,
  context?: string | HousingMoneyParseContext,
): HousingPriceParseResult;
export const parsePriceFromText: typeof parseHousingPrice;
