export type AliasMap = Readonly<Record<string, readonly string[]>>;
export type LexiconEntity = Readonly<{ canonical: string; aliases: AliasMap; country?: string }>;
export type MetroStation = Readonly<{ name: string; line: string; labels: Readonly<{ ru: string; en: string }>; aliases: readonly string[]; re: RegExp }>;

export function normalizeUnicode(value: unknown): string;
export function normalizeForMatch(value: unknown): string;
export function foldCyrillicForSearch(value: unknown): string;
export function normalizedAliasKeys(value: unknown): string[];
export function aliasesOf(entry: { aliases?: AliasMap | readonly string[] }): string[];
export function buildAliasIndex<T>(entries: readonly T[]): Map<string, T>;
export function findCanonical<T extends { canonical?: string; name?: string; aliases?: AliasMap | readonly string[] }>(value: unknown, entries: readonly T[], options?: { partial?: boolean }): T | null;
export function escapeRegex(value: unknown): string;
export function aliasesToRegex(values: readonly string[], flags?: string): RegExp;

export const UZ_CITIES: readonly LexiconEntity[];
export const KZ_CITIES: readonly LexiconEntity[];
export const CITIES: readonly LexiconEntity[];
export function canonicalCity(value: unknown, country?: string | null): string | null;

export const TASHKENT_DISTRICTS: readonly LexiconEntity[];
export function canonicalTashkentDistrict(value: unknown): string | null;
export const TASHKENT_METRO: readonly MetroStation[];
export const TASHKENT_METRO_BY_NAME: Map<string, MetroStation>;
export function canonicalTashkentMetro(value: unknown): string | null;
export function tashkentMetroLabels(): Record<string, { ru: string; en: string; line: string }>;
export const TASHKENT_AREAS: Readonly<Record<string, readonly Readonly<{ name: string; aliases: readonly string[] }>[]>>;

export const ADDRESS_TERMS: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export const DEAL_TYPES: readonly { canonical: string; aliases: AliasMap }[];
export const PROPERTY_TYPES: readonly { canonical: string; aliases: AliasMap }[];
export const ROOM_TERMS: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export const FLOOR_TERMS: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export const AREA_TERMS: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export const CURRENCIES: readonly { canonical: string; aliases: AliasMap }[];
export const SELLER_TERMS: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export const AMENITY_TERMS: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export const TENANT_TERMS: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export function flattenAliases(item: { aliases?: AliasMap }): string[];

export const HIRING_INTENT: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export const CANDIDATE_FIELD_TERMS: Readonly<Record<string, { canonical: string; aliases: AliasMap }>>;
export const EMPLOYMENT_TYPES: readonly { canonical: string; aliases: AliasMap }[];
export const WORK_MODES: readonly { canonical: string; aliases: AliasMap }[];
export const SENIORITY_TERMS: readonly { canonical: string; aliases: AliasMap }[];
export const PROFESSION_TERMS: readonly { canonical: string; aliases: AliasMap }[];
export const PERSON_LINEAGE_TERMS: Readonly<{ female: readonly string[]; male: readonly string[] }>;
