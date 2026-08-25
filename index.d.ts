export type AliasMap = Readonly<Record<string, readonly string[]>>;
export type LexiconEntity = Readonly<{
  canonical: string;
  aliases: AliasMap;
  country?: string;
  code?: string;
  currency?: string;
}>;
export type MetroStation = Readonly<{
  name: string;
  line: string;
  labels: Readonly<{ ru: string; en: string }>;
  aliases: readonly string[];
  re: RegExp;
}>;
export type LocationEntry = Readonly<{ name: string; aliases: readonly string[]; re: RegExp }>;
export type ResidentialComplexEntry = Readonly<{
  canonical: string;
  name: string;
  aliases: readonly string[];
  ambiguous: boolean;
  re: RegExp;
}>;
export type PoiEntry = Readonly<{
  canonical: string;
  name: string;
  category: string;
  aliases: readonly string[];
  re: RegExp;
  contextRequired: boolean;
  contextRe: RegExp | null;
}>;
export type MetropolitanEntity = Readonly<{
  canonical: string;
  name: string;
  type: string;
  aliases: readonly string[];
  re: RegExp;
  parent: string | null;
  cluster: string | null;
  contextRequired: boolean;
  contextRe: RegExp | null;
}>;
export type SearchCluster = Readonly<{
  canonical: string;
  name: string;
  type: 'search_cluster';
  administrative: false;
  members: readonly string[];
}>;
export type AreaEntry = Readonly<{ name: string; aliases: readonly string[] }>;
export type LocationCityDictionary = Readonly<{
  districts?: readonly LocationEntry[];
  microdistricts?: readonly LocationEntry[];
  metro?: readonly LocationEntry[] | readonly MetroStation[];
  residentialComplexes?: readonly LocationEntry[];
  streets?: readonly LocationEntry[];
  landmarks?: readonly LocationEntry[];
}>;

export function normalizeUnicode(value: unknown): string;
export function normalizeForMatch(value: unknown): string;
export function foldCyrillicForSearch(value: unknown): string;
export function normalizedAliasKeys(value: unknown): string[];
export function aliasesOf(entry: { aliases?: AliasMap | readonly string[] }): string[];
export function buildAliasIndex<T>(entries: readonly T[]): Map<string, T>;
export function findCanonical<T extends { canonical?: string; name?: string; aliases?: AliasMap | readonly string[] }>(value: unknown, entries: readonly T[], options?: { partial?: boolean }): T | null;
export function escapeRegex(value: unknown): string;
export function aliasesToRegex(values: readonly string[], flags?: string): RegExp;

export const COUNTRIES: readonly LexiconEntity[];
export function canonicalCountry(value: unknown): string | null;
export function canonicalCountryCode(value: unknown): string | null;
export function countryByCode(value: unknown): LexiconEntity | null;

export const UZ_CITIES: readonly LexiconEntity[];
export const KZ_CITIES: readonly LexiconEntity[];
export const CITIES: readonly LexiconEntity[];
export function canonicalCity(value: unknown, country?: string | null): string | null;
export const UA_CITIES: readonly LexiconEntity[];
export const RO_CITIES: readonly LexiconEntity[];
export const KG_CITIES: readonly LexiconEntity[];
export const GEOGRAPHY_CITIES: readonly LexiconEntity[];
export function canonicalAnyCity(value: unknown, country?: string | null): string | null;
export const UA_ADDITIONAL_CITIES: readonly LexiconEntity[];
export const UA_CITY_CATALOG: readonly LexiconEntity[];
export const UA_CITY_HISTORICAL_ALIASES: Readonly<Record<string, readonly string[]>>;
export function canonicalUkraineCity(value: unknown): string | null;
export const UA_LOCATION_TERMS: Readonly<Record<string, readonly string[]>>;

export const TASHKENT_DISTRICTS: readonly LexiconEntity[];
export function canonicalTashkentDistrict(value: unknown): string | null;
export const TASHKENT_METRO: readonly MetroStation[];
export const TASHKENT_METRO_BY_NAME: Map<string, MetroStation>;
export function canonicalTashkentMetro(value: unknown): string | null;
export function tashkentMetroLabels(): Record<string, { ru: string; en: string; line: string }>;
export const TASHKENT_AREAS: Readonly<Record<string, readonly AreaEntry[]>>;
export const TASHKENT_AREA_ADDITIONS: Readonly<Record<string, readonly AreaEntry[]>>;
export const FULL_TASHKENT_AREAS: Readonly<Record<string, readonly AreaEntry[]>>;
export const TASHKENT_RESIDENTIAL_COMPLEXES: readonly ResidentialComplexEntry[];
export function matchTashkentResidentialComplex(value: unknown): ResidentialComplexEntry | null;
export function canonicalTashkentResidentialComplex(value: unknown): string | null;
export const TASHKENT_PARKS: readonly PoiEntry[];
export const TASHKENT_SQUARES: readonly PoiEntry[];
export const TASHKENT_MARKETS: readonly PoiEntry[];
export const TASHKENT_MALLS: readonly PoiEntry[];
export const TASHKENT_ATTRACTIONS: readonly PoiEntry[];
export const TASHKENT_CULTURAL_POIS: readonly PoiEntry[];
export const TASHKENT_TRANSPORT_POIS: readonly PoiEntry[];
export const TASHKENT_UNIVERSITIES: readonly PoiEntry[];
export const TASHKENT_MEDICAL_POIS: readonly PoiEntry[];
export const TASHKENT_LEGACY_LANDMARKS: readonly PoiEntry[];
export const TASHKENT_POI_GROUPS: Readonly<Record<string, readonly PoiEntry[]>>;
export const TASHKENT_LANDMARKS: readonly PoiEntry[];
export function matchTashkentPoi(value: unknown, category?: string | null): PoiEntry | null;

export const ODESA_LOCAL_AREAS: readonly MetropolitanEntity[];
export const ODESA_MICRODISTRICT_EXTENSIONS: readonly MetropolitanEntity[];
export const ODESA_SUBURBS: readonly MetropolitanEntity[];
export const ODESA_DEVELOPMENT_AREAS: readonly MetropolitanEntity[];
export const ODESA_RIVIERA_ENTITIES: readonly MetropolitanEntity[];
export const ODESA_CONTEXT_POIS: readonly MetropolitanEntity[];
export const ODESA_METROPOLITAN_ENTITIES: readonly MetropolitanEntity[];
export const ODESA_SEARCH_CLUSTERS: readonly SearchCluster[];
export function matchOdesaMetropolitanEntities(value: unknown): Readonly<{ matches: readonly MetropolitanEntity[]; searchClusters: readonly SearchCluster[] }>;
export function matchOdesaMetropolitanEntity(value: unknown, type?: string | null): MetropolitanEntity | null;

export const UZ_REGIONS: readonly LexiconEntity[];
export const KZ_REGIONS: readonly LexiconEntity[];
export const UA_REGIONS: readonly LexiconEntity[];
export const RO_REGIONS: readonly LexiconEntity[];
export const REGIONS: readonly LexiconEntity[];
export function canonicalRegion(value: unknown, country?: string | null): string | null;

export const LOCATION_DICTIONARIES: Readonly<Record<string, Readonly<Record<string, LocationCityDictionary>>>>;
export const UA_EXTRA_LOCATION_DICTIONARIES: Readonly<Record<string, LocationCityDictionary>>;
export const UA_REGION_ENTRIES: readonly LocationEntry[];
export const UA_SECONDARY_CITIES: Readonly<Record<string, { aliases: readonly string[]; re: RegExp; microdistricts?: readonly LocationEntry[] }>>;
export function matchUkraineRegion(text: unknown): LocationEntry | null;
export function matchUkraineSecondaryCity(text: unknown): ({ city: string; aliases: readonly string[]; re: RegExp; microdistricts?: readonly LocationEntry[] }) | null;
export function dictionaryFor(countryCode: string, city: string): LocationCityDictionary | null;
export function locationCities(countryCode: string): Readonly<Record<string, LocationCityDictionary>>;
export function matchDictionaryLocation(text: unknown, countryCode: string, city?: string | null): { city: string; type: string; name: string; aliases: readonly string[] } | null;

export const GENERIC_LANDMARK_TERMS: readonly LexiconEntity[];

export const ADDRESS_TERMS: Readonly<Record<string, LexiconEntity>>;
export const DEAL_TYPES: readonly LexiconEntity[];
export const HOUSING_OCCUPANCY_TYPES: readonly LexiconEntity[];
export const PROPERTY_TYPES: readonly LexiconEntity[];
export const ROOM_TERMS: Readonly<Record<string, LexiconEntity>>;
export const FLOOR_TERMS: Readonly<Record<string, LexiconEntity>>;
export const AREA_TERMS: Readonly<Record<string, LexiconEntity>>;
export const CURRENCIES: readonly LexiconEntity[];
export const SELLER_TERMS: Readonly<Record<string, LexiconEntity>>;
export const DEPOSIT_TERMS: Readonly<Record<string, LexiconEntity>>;
export const UTILITY_TERMS: Readonly<Record<string, LexiconEntity>>;
export const APPLIANCE_TERMS: Readonly<Record<string, LexiconEntity>>;
export const AMENITY_TERMS: Readonly<Record<string, LexiconEntity>>;
export const TENANT_TERMS: Readonly<Record<string, LexiconEntity>>;
export function flattenAliases(item: { aliases?: AliasMap }): string[];

export const HIRING_INTENT: Readonly<Record<string, LexiconEntity>>;
export const CANDIDATE_FIELD_TERMS: Readonly<Record<string, LexiconEntity>>;
export const JOB_FIELD_TERMS: Readonly<Record<string, LexiconEntity>>;
export const EMPLOYMENT_TYPES: readonly LexiconEntity[];
export const WORK_MODES: readonly LexiconEntity[];
export const SCHEDULE_TERMS: readonly LexiconEntity[];
export const PROBATION_TERMS: Readonly<Record<string, LexiconEntity>>;
export const EXPERIENCE_REQUIREMENTS: Readonly<Record<string, LexiconEntity>>;
export const SKILL_FIELD_TERMS: Readonly<Record<string, LexiconEntity>>;
export const BENEFIT_TERMS: Readonly<Record<string, LexiconEntity>>;
export const SENIORITY_TERMS: readonly LexiconEntity[];
export const PROFESSION_TERMS: readonly LexiconEntity[];
export const PERSON_LINEAGE_TERMS: Readonly<{ female: readonly string[]; male: readonly string[] }>;
