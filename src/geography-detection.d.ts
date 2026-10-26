export type DetectedCity = Readonly<{
  canonical: string;
  country: string | null;
}>;

export function detectCountryCodeFromText(value: unknown): string | null;
export function detectCityFromText(value: unknown, country?: string | null): DetectedCity | null;
export function detectCitiesFromText(value: unknown, country?: string | null): readonly DetectedCity[];
