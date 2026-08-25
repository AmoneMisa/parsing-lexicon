export type DetectedCity = Readonly<{
  canonical: string;
  country: string | null;
}>;

export const HIRING_GLOBAL_CITIES: readonly Readonly<{
  canonical: string;
  country: string;
  type: 'city';
  aliases: Readonly<Record<string, readonly string[]>>;
}>[];

export function detectCountryCodeFromText(value: unknown): string | null;
export function detectCityFromText(value: unknown, country?: string | null): DetectedCity | null;
