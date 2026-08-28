export interface TashkentHousingLocationEntry {
  readonly canonical: string;
  readonly name: string;
  readonly category: string;
  readonly country: 'UZ';
  readonly city: 'Tashkent';
  readonly aliases: readonly string[];
  readonly re: RegExp;
  readonly contextRequired: boolean;
  readonly contextRe: RegExp | null;
}

export interface TashkentNumberedAreaMatch {
  readonly number: number;
  readonly suffix: string;
}

export interface TashkentMetroEntry {
  readonly canonical: string;
  readonly name: string;
  readonly type: 'metro';
  readonly country: 'UZ';
  readonly city: 'Tashkent';
  readonly line: string;
  readonly labels: Readonly<{ ru: string; en: string }>;
  readonly aliases: readonly string[];
  readonly re: RegExp;
}

export interface TashkentDistrictEntry {
  readonly canonical: string;
  readonly name: string;
  readonly type: 'district';
  readonly country: 'UZ';
  readonly city: 'Tashkent';
  readonly re: RegExp;
}

export const TASHKENT_HOUSING_LANDMARKS: readonly TashkentHousingLocationEntry[];
export const TASHKENT_NUMBERED_AREA_ALIASES: Readonly<Record<string, readonly string[]>>;

export function matchTashkentHousingLandmarks(value: unknown): TashkentHousingLocationEntry[];
export function matchTashkentNumberedArea(value: unknown, canonical: string): TashkentNumberedAreaMatch | null;
export function hasTashkentAreaAlias(value: unknown, canonical: string): boolean;
export function hasExplicitTashkentDistrict(value: unknown, canonical: string): boolean;
export function matchTashkentHousingDistrict(value: unknown): TashkentDistrictEntry | null;
export function matchTashkentHousingQuarter(value: unknown): Readonly<{ district: string; number: number; suffix: string }> | null;
export function matchTashkentHousingMetro(value: unknown): TashkentMetroEntry | null;
export function matchTashkentHousingTransit(value: unknown): TashkentHousingLocationEntry | null;
