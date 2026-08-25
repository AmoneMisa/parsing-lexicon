export type GeographyDisplayKind = 'city' | 'district' | 'metro' | 'any';

export const GEOGRAPHY_DISPLAY_NAMES: Readonly<Record<string, Readonly<{
  city: Readonly<Record<string, string>>;
  district: Readonly<Record<string, string>>;
  metro: Readonly<Record<string, string>>;
  metroAlias: Readonly<Record<string, string>>;
}>>>;

export function geographyDisplayName(value: unknown, locale?: string, kind?: GeographyDisplayKind): string;
export function geographyMetroLabelWithAlias(value: unknown, locale?: string): string;
