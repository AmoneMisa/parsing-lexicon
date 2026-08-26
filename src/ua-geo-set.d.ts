export interface UkraineAdministrativeGeoEntity {
  code: string;
  name: string;
  category: string;
  type: 'region' | 'special_city' | 'district' | 'community' | 'city' | 'urban_settlement' | 'village' | 'settlement' | 'city_district' | string;
  parentCode: string | null;
  source: 'katottg';
}

export interface UkraineInternalGeoEntity {
  city: string;
  type: string;
  canonical: string;
  aliases: readonly string[];
  source: 'curated';
}

export interface UkraineAdministrativeGeoMeta {
  authority: string;
  snapshot: string;
  source: string;
  generated: boolean;
  runtimeDependency: boolean;
  recordCount: number;
  countsByCategory: Readonly<Record<string, number>>;
  schema: readonly string[];
}

export const UA_ADMINISTRATIVE_GEO_META: Readonly<UkraineAdministrativeGeoMeta>;

export function ukraineAdministrativeGeoSet(): readonly Readonly<UkraineAdministrativeGeoEntity>[];
export function ukraineAdministrativeGeoByCode(code: string): Readonly<UkraineAdministrativeGeoEntity> | null;
export function findUkraineAdministrativeGeo(
  value: string,
  options?: { types?: readonly string[]; parentCode?: string; limit?: number },
): readonly Readonly<UkraineAdministrativeGeoEntity>[];
export function ukraineAdministrativeChildrenOf(
  parentCode: string,
  options?: { types?: readonly string[] },
): readonly Readonly<UkraineAdministrativeGeoEntity>[];
export function ukraineAdministrativeAncestry(
  value: string | UkraineAdministrativeGeoEntity,
): readonly Readonly<UkraineAdministrativeGeoEntity>[];
export function ukraineAdministrativeGeocodeCandidates(
  value: string | UkraineAdministrativeGeoEntity,
): readonly string[];
export function ukraineInternalGeoSet(): readonly Readonly<UkraineInternalGeoEntity>[];
export function ukraineGeoSetCoverage(): Readonly<{
  snapshot: string;
  administrative: number;
  internal: number;
  administrativeByType: Readonly<Record<string, number>>;
  internalByType: Readonly<Record<string, number>>;
}>;
