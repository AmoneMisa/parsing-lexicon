export type PriceParseResult = Readonly<{
  price: number | null;
  currency: string;
}>;

export function parsePriceFromText(value: unknown, fallbackCurrency?: string): PriceParseResult;
