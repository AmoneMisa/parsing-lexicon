export type HousingPriceParseResult = Readonly<{
  price: number | null;
  currency: string;
}>;

export function parseHousingPrice(value: unknown, fallbackCurrency?: string): HousingPriceParseResult;
export const parsePriceFromText: typeof parseHousingPrice;
