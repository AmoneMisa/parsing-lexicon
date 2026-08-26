export type CountryContext = Readonly<{
  code: string;
  country: string;
  currency: string | null;
  phoneCountry: string;
}>;

export function countryContext(value: unknown): CountryContext | null;
export function countryCurrency(value: unknown): string | null;
export function countryPhoneHint(value: unknown): string | null;
