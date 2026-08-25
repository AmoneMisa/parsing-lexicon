export type LexiconLanguage = 'ru' | 'en' | 'uk' | 'ro' | 'uzLatn' | 'uzCyrl' | 'kk';
export type CountryCode = 'UZ' | 'KZ' | 'UA' | 'RO' | 'KG';
export type AliasMap = Readonly<Partial<Record<LexiconLanguage, readonly string[]>>>;
export type LexiconEntity = Readonly<{
  canonical: string;
  aliases: AliasMap;
  country?: CountryCode;
  city?: string;
  code?: string;
  currency?: string;
  region?: string;
  type?: string;
  status?: string;
  priority?: string;
  localCanonical?: string;
  contextRequired?: boolean;
  multiplier?: number;
}>;
export type MetroStation = Readonly<{
  canonical: string;
  name: string;
  type: 'metro';
  country: 'UZ';
  city: 'Tashkent';
  line: string;
  labels: Readonly<{ ru: string; en: string }>;
  aliases: readonly string[];
  re: RegExp;
}>;
export type LocationEntry = Readonly<{
  canonical: string;
  name: string;
  type?: string;
  aliases: readonly string[];
  re: RegExp;
  entityType?: string;
  country?: CountryCode;
  city?: string;
  district?: string;
  parent?: string;
  confidence?: string;
  language?: string;
}>;
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
  canonical?: string;
  name: string;
  type: 'search_cluster';
  administrative: false;
  country?: CountryCode;
  city?: string;
  members: readonly string[];
}>;
export type AreaEntry = Readonly<{
  canonical: string;
  name: string;
  type: 'local_area';
  country: 'UZ';
  city: 'Tashkent';
  aliases: readonly string[];
}>;
export type LocationCityDictionary = Readonly<{
  districts?: readonly LocationEntry[];
  microdistricts?: readonly LocationEntry[];
  mahallas?: readonly LocationEntry[];
  localAreas?: readonly LocationEntry[];
  suburbs?: readonly LocationEntry[];
  settlements?: readonly LocationEntry[];
  metro?: readonly LocationEntry[] | readonly MetroStation[];
  residentialComplexes?: readonly LocationEntry[];
  streets?: readonly LocationEntry[];
  landmarks?: readonly LocationEntry[];
  pois?: readonly LocationEntry[];
  searchClusters?: readonly LocationEntry[];
}>;
export type CentralAsiaLocationMatch = Readonly<{
  country: 'KZ' | 'UZ' | null;
  city: string;
  type: string;
  key: string;
  name: string;
  aliases: readonly string[];
  district: string | null;
  parent: string | null;
  confidence: string | null;
  language: string | null;
}>;
export type CentralAsiaLocationResult = Readonly<{
  city: string | null;
  matches: readonly CentralAsiaLocationMatch[];
  searchClusters: readonly SearchCluster[];
  candidates: readonly Readonly<{ city: string; matches: readonly CentralAsiaLocationMatch[] }>[];
}>;

export type ProfessionEntry = Readonly<{
  id: string;
  canonical: string;
  group: string;
  family: string;
  aliases: readonly string[];
  strongAliases: readonly string[];
  weakAliases: readonly string[];
  strongRe: RegExp;
  weakRe: RegExp | null;
}>;
export type ProfessionMatch = Readonly<{
  id: string;
  canonical: string;
  group: string;
  family: string;
  score: number;
  strength: 'strong' | 'weak';
  matched: string;
}>;
export type SalaryParseResult = Readonly<{
  min: number | null;
  max: number | null;
  currency: string | null;
  period: 'hour' | 'day' | 'shift' | 'week' | 'month' | 'year' | 'project' | 'piece' | null;
  gross: boolean | null;
  negotiable: boolean;
  approximate: boolean;
}>;
export type ExperienceParseResult = Readonly<{
  requirement: 'none' | 'preferred' | 'required';
  minYears: number | null;
  maxYears: number | null;
}>;
export type CanonicalMatch<T> = Readonly<{
  entry: T;
  canonical: string | null;
  alias: string;
  sourceAlias: string;
  normalizedAlias: string;
  start: number;
  end: number;
}>;
export type LexiconValidationError = Readonly<{
  kind: string;
  [key: string]: unknown;
}>;
export type LexiconValidationReport = Readonly<{
  ok: boolean;
  errors: readonly LexiconValidationError[];
}>;

export const LEXICON_LANGUAGES: readonly LexiconLanguage[];
export const COUNTRY_CODES: readonly CountryCode[];
export function deepFreeze<T>(value: T): Readonly<T>;
export function freezeAliases(aliases?: AliasMap | readonly string[]): AliasMap | readonly string[];
export function lexiconEntity(canonical: string, aliases?: AliasMap, extra?: Record<string, unknown>): LexiconEntity;
export function locationEntity(canonical: string, aliases?: readonly string[], extra?: Record<string, unknown>): LocationEntry;

export function normalizeUnicode(value: unknown): string;
export function normalizeForMatch(value: unknown): string;
export function foldCyrillicForSearch(value: unknown): string;
export function normalizedAliasKeys(value: unknown, options?: { transliteration?: boolean }): string[];
export function aliasesOf(entry: { aliases?: AliasMap | readonly string[] }): string[];
export function buildAliasIndex<T>(entries: readonly T[], options?: { transliteration?: boolean }): Map<string, T>;
export function getAliasIndex<T>(entries: readonly T[], options?: { transliteration?: boolean }): Map<string, T>;
export function getAliasOwnersIndex<T>(entries: readonly T[], options?: { transliteration?: boolean }): Map<string, ReadonlyArray<Readonly<{ entry: T; sourceAlias: string; searchAlias: string }>>>;
export function findCanonical<T extends { canonical?: string; name?: string; aliases?: AliasMap | readonly string[] }>(value: unknown, entries: readonly T[], options?: { partial?: boolean; transliteration?: boolean }): T | null;
export function findAllCanonical<T extends { canonical?: string; name?: string; aliases?: AliasMap | readonly string[] }>(value: unknown, entries: readonly T[], options?: { transliteration?: boolean }): CanonicalMatch<T>[];
export function collectAliasCollisions(entries: readonly unknown[], options?: { includeSearchFolds?: boolean; allowed?: readonly string[] }): ReadonlyArray<Readonly<{ alias: string; canonicals: readonly string[] }>>;
export function validateAliasCollisions(entries: readonly unknown[], options?: { includeSearchFolds?: boolean; allowed?: readonly string[] }): true;
export function validateLexicon(entries: readonly unknown[], options?: { allowedCollisions?: readonly string[]; allowedLanguageKeys?: readonly LexiconLanguage[]; allowDuplicateCanonicals?: boolean }): LexiconValidationReport;
export function assertValidLexicon(entries: readonly unknown[], options?: { allowedCollisions?: readonly string[]; allowedLanguageKeys?: readonly LexiconLanguage[]; allowDuplicateCanonicals?: boolean }): true;
export function escapeRegex(value: unknown): string;
export function aliasesToRegex(values: readonly string[], flags?: string): RegExp;

export const COUNTRIES: readonly LexiconEntity[];
export function canonicalCountry(value: unknown): string | null;
export function canonicalCountryCode(value: unknown): CountryCode | null;
export function countryByCode(value: unknown): LexiconEntity | null;

export const UZ_CITIES: readonly LexiconEntity[];
export const KZ_CITIES: readonly LexiconEntity[];
export const CITIES: readonly LexiconEntity[];
export function canonicalCity(value: unknown, country?: CountryCode | null): string | null;
export const UA_CITIES: readonly LexiconEntity[];
export const RO_CITIES: readonly LexiconEntity[];
export const KG_CITIES: readonly LexiconEntity[];
export const GEOGRAPHY_CITIES: readonly LexiconEntity[];
export function canonicalAnyCity(value: unknown, country?: CountryCode | null): string | null;
export const UA_ADDITIONAL_CITIES: readonly LexiconEntity[];
export const UA_CITY_CATALOG: readonly LexiconEntity[];
export const UA_CITY_HISTORICAL_ALIASES: Readonly<Record<string, readonly string[]>>;
export function canonicalUkraineCity(value: unknown): string | null;
export const UA_LOCATION_TERMS: Readonly<Record<string, readonly string[]>>;

export const KZ_CITY_ADDITIONS: readonly LexiconEntity[];
export const KZ_CITY_CATALOG: readonly LexiconEntity[];
export const KZ_SEARCH_TARGETS: readonly LexiconEntity[];
export const UZ_CITY_ADDITIONS: readonly LexiconEntity[];
export const UZ_CITY_CATALOG: readonly LexiconEntity[];
export const UZ_SEARCH_TARGETS: readonly LexiconEntity[];
export const KZ_LOCATION_TERMS: Readonly<Record<string, readonly string[]>>;
export const UZ_LOCATION_TERMS: Readonly<Record<string, readonly string[]>>;
export function canonicalKazakhstanCity(value: unknown): string | null;
export function canonicalUzbekistanCity(value: unknown): string | null;
export function canonicalCentralAsiaCity(value: unknown, country?: 'KZ' | 'UZ' | null): string | null;
export function centralAsiaCityAliases(canonical: string, country?: 'KZ' | 'UZ' | null): readonly string[];

export const TASHKENT_DISTRICTS: readonly LexiconEntity[];
export function canonicalTashkentDistrict(value: unknown): string | null;
export const TASHKENT_METRO: readonly MetroStation[];
export function tashkentMetroStation(value: unknown): MetroStation | null;
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
export function canonicalRegion(value: unknown, country?: CountryCode | null): string | null;

export const LOCATION_LIST_KEYS: readonly string[];
export function locationEntry(name: string, ...aliases: string[]): LocationEntry;
export function locationEntries(rows?: readonly (readonly string[])[]): readonly LocationEntry[];
export function mergeLocationEntries(...lists: readonly LocationEntry[][]): readonly LocationEntry[];
export function mergeLocationCityDictionaries(...dictionaries: readonly LocationCityDictionary[]): LocationCityDictionary;
export function mergeLocationCountries(...countries: readonly Readonly<Record<string, LocationCityDictionary>>[]): Readonly<Record<string, LocationCityDictionary>>;

export const LOCATION_DICTIONARIES: Readonly<Record<string, Readonly<Record<string, LocationCityDictionary>>>>;
export const UA_EXTRA_LOCATION_DICTIONARIES: Readonly<Record<string, LocationCityDictionary>>;
export const UA_REGION_ENTRIES: readonly LocationEntry[];
export const UA_SECONDARY_CITIES: Readonly<Record<string, { aliases: readonly string[]; re: RegExp; microdistricts?: readonly LocationEntry[] }>>;
export function matchUkraineRegion(text: unknown): LocationEntry | null;
export function matchUkraineSecondaryCity(text: unknown): ({ city: string; aliases: readonly string[]; re: RegExp; microdistricts?: readonly LocationEntry[] }) | null;
export function dictionaryFor(countryCode: CountryCode, city: string): LocationCityDictionary | null;
export function locationCities(countryCode: CountryCode): Readonly<Record<string, LocationCityDictionary>>;
export function matchDictionaryLocation(text: unknown, countryCode: CountryCode, city?: string | null): { city: string; type: string; name: string; aliases: readonly string[] } | null;

export const KZ_LOCATION_EXTENSIONS: Readonly<Record<string, LocationCityDictionary>>;
export const KZ_SEARCH_CLUSTERS: readonly SearchCluster[];
export const KZ_AMBIGUOUS_LOCAL_NAMES: readonly string[];
export const UZ_LOCATION_EXTENSIONS: Readonly<Record<string, LocationCityDictionary>>;
export const UZ_AMBIGUOUS_LOCAL_NAMES: readonly string[];
export const UZ_KARAKALPAK_LANGUAGE_TAGS: readonly string[];
export const KZ_EXPANDED_LOCATION_DICTIONARIES: Readonly<Record<string, LocationCityDictionary>>;
export const UZ_EXPANDED_LOCATION_DICTIONARIES: Readonly<Record<string, LocationCityDictionary>>;
export const CENTRAL_ASIA_LOCATION_DICTIONARIES: Readonly<Record<'KZ' | 'UZ', Readonly<Record<string, LocationCityDictionary>>>>;
export function centralAsiaLocationCities(countryCode: 'KZ' | 'UZ'): Readonly<Record<string, LocationCityDictionary>>;
export function centralAsiaLocationCity(countryCode: 'KZ' | 'UZ', city: string): LocationCityDictionary | null;
export function matchCentralAsiaLocationEntities(text: unknown, countryCode: 'KZ' | 'UZ', preferredCity?: string | null): CentralAsiaLocationResult;
export function matchCentralAsiaLocationEntity(text: unknown, countryCode: 'KZ' | 'UZ', preferredCity?: string | null, type?: string | null): CentralAsiaLocationMatch | null;

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

export const CURRENCY_TERMS: readonly LexiconEntity[];
export const SALARY_PERIODS: readonly LexiconEntity[];
export const SALARY_MODIFIERS: Readonly<Record<string, LexiconEntity>>;
export const NUMBER_MULTIPLIERS: readonly LexiconEntity[];
export function parseSalary(value: unknown): SalaryParseResult | null;
export function salaryCurrency(value: unknown): string | null;
export function salaryPeriod(value: unknown): SalaryParseResult['period'];
export function currencyAliases(code: string): readonly string[];

export const PROFESSION_CATALOG: readonly ProfessionEntry[];
export const PROFESSION_GROUPS: ReadonlyArray<Readonly<{ id: string; canonical: string; family: string; aliases: readonly string[]; professions: readonly string[] }>>;
export const SENIORITY_LEVELS: ReadonlyArray<Readonly<{ canonical: string; aliases: readonly string[]; score: number; re: RegExp }>>;
export function matchProfessions(value: unknown, options?: { limit?: number; allowWeak?: boolean }): ProfessionMatch[];
export function matchProfession(value: unknown, options?: { allowWeak?: boolean }): ProfessionMatch | null;
export function matchProfessionGroup(value: unknown): Readonly<{ id: string; canonical: string; family: string; aliases: readonly string[]; professions: readonly string[]; score: number; matched: string }> | null;
export function matchSeniority(value: unknown): Readonly<{ canonical: string; score: number; matched: string; index: number }> | null;
export function professionByCanonical(canonical: string): ProfessionEntry | null;

export const HIRING_INTENT_EXTENSIONS: Readonly<Record<'candidate' | 'employer', LexiconEntity>>;
export const HIRING_NEGATIVE_INTENT: readonly LexiconEntity[];
export const VACANCY_FIELD_TERMS: Readonly<Record<string, LexiconEntity>>;
export const WORK_SCHEDULE_EXTENSIONS: readonly LexiconEntity[];
export const EXPERIENCE_MODIFIERS: readonly LexiconEntity[];
export function detectHiringNegativeIntent(value: unknown): Readonly<{ canonical: string; matched: string }> | null;
export function classifyHiringIntent(value: unknown): Readonly<{ intent: 'candidate' | 'employer' | 'negative' | null; reason: string | null; matched: string | null; confidence: number }>;
export function parseExperience(value: unknown): ExperienceParseResult | null;

export * from './src/housing-context.js';
export * from './src/hiring-context.js';
export * from './src/housing-intent.js';
export * from './src/housing-structured.js';