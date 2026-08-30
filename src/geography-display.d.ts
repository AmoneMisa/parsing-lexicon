export type GeographyDisplayKind =
  | 'country'
  | 'region'
  | 'city'
  | 'district'
  | 'microdistrict'
  | 'mahalla'
  | 'local_area'
  | 'suburb'
  | 'settlement'
  | 'development_area'
  | 'residential_complex'
  | 'metro'
  | 'street'
  | 'poi'
  | 'any';

export type GeographyDisplayContext = Readonly<{
  country?: string | null;
  city?: string | null;
}>;

export const GEOGRAPHY_DISPLAY_NAMES: Readonly<Record<string, Readonly<{
  country: Readonly<Record<string, string>>;
  city: Readonly<Record<string, string>>;
  region?: Readonly<Record<string, string>>;
  district: Readonly<Record<string, string>>;
  microdistrict: Readonly<Record<string, string>>;
  metro: Readonly<Record<string, string>>;
  metroAlias: Readonly<Record<string, string>>;
}>>>;

export function geographyDisplayName(
  value: unknown,
  locale?: string,
  kind?: GeographyDisplayKind,
  context?: GeographyDisplayContext | null,
): string;
export function geographyMetroLabelWithAlias(value: unknown, locale?: string): string;
