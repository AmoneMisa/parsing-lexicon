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

export function parseHousingPrice(
  value: unknown,
  context?: string | HousingMoneyParseContext,
): HousingPriceParseResult;
export function parseHousingPricePerSqm(
  value: unknown,
  context?: string | HousingMoneyParseContext,
): HousingPriceParseResult;
export const parsePriceFromText: typeof parseHousingPrice;
