export type HousingPriceParseResult = Readonly<{
  amount: number | null;
  currency: string;
  approximate: boolean;
}>;

export function parseHousingPrice(value: unknown, fallbackCurrency?: string): HousingPriceParseResult;
export function parseHousingPricePerSqm(value: unknown, fallbackCurrency?: string): HousingPriceParseResult;
export const parsePriceFromText: typeof parseHousingPrice;