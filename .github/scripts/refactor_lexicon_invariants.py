from pathlib import Path
import re


def read(path: str) -> str:
    return Path(path).read_text()


def write(path: str, text: str) -> None:
    Path(path).write_text(text)


def ensure_import(text: str, line: str) -> str:
    if line in text:
        return text
    matches = list(re.finditer(r'^import .*?;\n', text, re.M))
    if matches:
        pos = matches[-1].end()
        return text[:pos] + line + '\n' + text[pos:]
    return line + '\n' + text


# ---------- Runtime immutability ----------
files_with_group = [
    'src/housing.js',
    'src/hiring.js',
    'src/money.js',
    'src/hiring-advanced.js',
    'src/hiring-languages.js',
    'src/housing-intent.js',
]
for path in files_with_group:
    text = read(path)
    text = ensure_import(text, "import { lexiconEntity } from './lexicon-core.js';")
    text = text.replace(
        "const group = (canonical, aliases, extra = {}) => Object.freeze({ canonical, aliases: Object.freeze(aliases), ...extra });",
        "const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);",
    )
    write(path, text)

path = 'src/landmarks.js'
text = read(path)
text = ensure_import(text, "import { lexiconEntity } from './lexicon-core.js';")
text = text.replace(
    "const group = (canonical, aliases) => Object.freeze({ canonical, aliases: Object.freeze(aliases) });",
    "const group = (canonical, aliases) => lexiconEntity(canonical, aliases);",
)
write(path, text)

path = 'src/countries.js'
text = read(path)
text = ensure_import(text, "import { deepFreeze, freezeAliases } from './lexicon-core.js';")
text = text.replace(
    "const country = (code, canonical, currency, aliases) => Object.freeze({\n  code,\n  canonical,\n  currency,\n  aliases: Object.freeze(aliases),\n});",
    "const country = (code, canonical, currency, aliases) => deepFreeze({\n  code,\n  canonical,\n  type: 'country',\n  currency,\n  aliases: freezeAliases(aliases),\n});",
)
write(path, text)

# Validate canonical identity against aliases too, not only alias-vs-alias.
path = 'src/normalization.js'
text = read(path)
needle = "    const canonicalKey = normalizeForMatch(canonical);\n    if (!allowDuplicateCanonicals && canonicalOwners.has(canonicalKey)) {"
replacement = "    const canonicalKey = normalizeForMatch(canonical);\n    const canonicalAliasOwners = aliasOwners.get(canonicalKey) || new Set();\n    canonicalAliasOwners.add(canonical);\n    aliasOwners.set(canonicalKey, canonicalAliasOwners);\n    if (!allowDuplicateCanonicals && canonicalOwners.has(canonicalKey)) {"
if needle in text:
    text = text.replace(needle, replacement)
write(path, text)

# Non-language alias bucket was invalid under the strict alias schema.
path = 'src/central-asia.js'
text = read(path)
text = text.replace(
    "city('Almaty', { kk: ['Алматы'], ru: ['Алма-Ата', 'Алма Ата'], en: ['Alma-Ata', 'Alma Ata'], historical: ['Верный', 'Verny'] }, { country: 'KZ', priority: 'P0' })",
    "city('Almaty', { kk: ['Алматы'], ru: ['Алма-Ата', 'Алма Ата', 'Верный'], en: ['Alma-Ata', 'Alma Ata', 'Verny'] }, { country: 'KZ', priority: 'P0' })",
)
write(path, text)

# ---------- Self-contained geo entities + cached country partitions ----------
path = 'src/geo.js'
text = read(path)
text = ensure_import(text, "import { deepFreeze, lexiconEntity } from './lexicon-core.js';")
text = text.replace(
    "const entity = (canonical, aliases, extra = {}) => Object.freeze({ canonical, aliases: Object.freeze(aliases), ...extra });",
    "const entity = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, { type: extra.type || (extra.country ? 'city' : 'district'), ...(!extra.country ? { country: 'UZ', city: 'Tashkent' } : {}), ...extra });",
)
text = text.replace("en: ['Oral', 'Uralsk', 'Uralsk']", "en: ['Oral', 'Uralsk']")
text = text.replace("en: ['Kokshetau', 'Kokshetau']", "en: ['Kokshetau']")
old_city = """export const CITIES = Object.freeze([...UZ_CITIES, ...KZ_CITIES]);

export function canonicalCity(value, country = null) {
  const catalog = country ? CITIES.filter((item) => item.country === country) : CITIES;
  return findCanonical(value, catalog)?.canonical || null;
}"""
new_city = """export const CITIES = Object.freeze([...UZ_CITIES, ...KZ_CITIES]);
export const CITIES_BY_COUNTRY = Object.freeze(Object.fromEntries(
  [...new Set(CITIES.map((item) => item.country).filter(Boolean))].map((code) => [
    code,
    Object.freeze(CITIES.filter((item) => item.country === code)),
  ]),
));

export function canonicalCity(value, country = null) {
  const catalog = country ? (CITIES_BY_COUNTRY[country] || []) : CITIES;
  return findCanonical(value, catalog)?.canonical || null;
}"""
text = text.replace(old_city, new_city)
old_station = """function station(name, ru, en, line, aliases = []) {
  const allAliases = [...new Set([name, ru, en, ...aliases])];
  return Object.freeze({ name, line, labels: Object.freeze({ ru, en }), aliases: Object.freeze(allAliases), re: aliasesToRegex(allAliases) });
}"""
new_station = """function station(name, ru, en, line, aliases = []) {
  const allAliases = [...new Set([name, ru, en, ...aliases])];
  return deepFreeze({
    canonical: name,
    name,
    type: 'metro',
    country: 'UZ',
    city: 'Tashkent',
    line,
    labels: { ru, en },
    aliases: allAliases,
    re: aliasesToRegex(allAliases),
  });
}"""
text = text.replace(old_station, new_station)
text = text.replace(
    "export const TASHKENT_METRO_BY_NAME = new Map(TASHKENT_METRO.map((item) => [item.name, item]));",
    "const TASHKENT_METRO_BY_NAME = new Map(TASHKENT_METRO.map((item) => [item.name, item]));",
)
old_canonical_metro = """export function canonicalTashkentMetro(value) {
  if (!value) return null;
  const direct = TASHKENT_METRO_BY_NAME.get(String(value));
  if (direct) return direct.name;
  return TASHKENT_METRO.find((item) => item.re.test(String(value)))?.name || null;
}"""
new_canonical_metro = """export function tashkentMetroStation(value) {
  if (!value) return null;
  const direct = TASHKENT_METRO_BY_NAME.get(String(value));
  if (direct) return direct;
  return TASHKENT_METRO.find((item) => item.re.test(String(value))) || null;
}

export function canonicalTashkentMetro(value) {
  return tashkentMetroStation(value)?.canonical || null;
}"""
text = text.replace(old_canonical_metro, new_canonical_metro)
text = text.replace(
    "const area = (name, aliases) => Object.freeze({ name, aliases: Object.freeze(aliases) });",
    "const area = (name, aliases) => deepFreeze({ canonical: name, name, type: 'local_area', country: 'UZ', city: 'Tashkent', aliases });",
)
write(path, text)

path = 'src/geography.js'
text = read(path)
text = ensure_import(text, "import { lexiconEntity } from './lexicon-core.js';")
text = text.replace(
    "const entity = (canonical, aliases, extra = {}) => Object.freeze({ canonical, aliases: Object.freeze(aliases), ...extra });",
    "const entity = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);",
)
# Add type metadata without changing established canonicals.
text = re.sub(r"entity\(([^\n]+?), \{([^\n]+?)\}, \{ country: '([^']+)' \}\)", r"entity(\1, {\2}, { country: '\3', type: 'city' })", text, count=0)
old_geo = """export const GEOGRAPHY_CITIES = Object.freeze([...CENTRAL_ASIA_CITIES, ...UA_CITIES, ...RO_CITIES, ...KG_CITIES]);

export function canonicalAnyCity(value, country = null) {
  const catalog = country ? GEOGRAPHY_CITIES.filter((item) => item.country === country) : GEOGRAPHY_CITIES;
  return findCanonical(value, catalog)?.canonical || null;
}"""
new_geo = """export const GEOGRAPHY_CITIES = Object.freeze([...CENTRAL_ASIA_CITIES, ...UA_CITIES, ...RO_CITIES, ...KG_CITIES]);
export const GEOGRAPHY_CITIES_BY_COUNTRY = Object.freeze(Object.fromEntries(
  [...new Set(GEOGRAPHY_CITIES.map((item) => item.country).filter(Boolean))].map((code) => [
    code,
    Object.freeze(GEOGRAPHY_CITIES.filter((item) => item.country === code)),
  ]),
));

export function canonicalAnyCity(value, country = null) {
  const catalog = country ? (GEOGRAPHY_CITIES_BY_COUNTRY[country] || []) : GEOGRAPHY_CITIES;
  return findCanonical(value, catalog)?.canonical || null;
}"""
text = text.replace(old_geo, new_geo)
old_regions = """export const REGIONS = Object.freeze([...UZ_REGIONS, ...KZ_REGIONS, ...UA_REGIONS, ...RO_REGIONS]);

export function canonicalRegion(value, country = null) {
  const catalog = country ? REGIONS.filter((item) => item.country === country) : REGIONS;
  return findCanonical(value, catalog, { partial: true })?.canonical || null;
}"""
new_regions = """export const REGIONS = Object.freeze([...UZ_REGIONS, ...KZ_REGIONS, ...UA_REGIONS, ...RO_REGIONS]);
export const REGIONS_BY_COUNTRY = Object.freeze(Object.fromEntries(
  [...new Set(REGIONS.map((item) => item.country).filter(Boolean))].map((code) => [
    code,
    Object.freeze(REGIONS.filter((item) => item.country === code)),
  ]),
));

export function canonicalRegion(value, country = null) {
  const catalog = country ? (REGIONS_BY_COUNTRY[country] || []) : REGIONS;
  return findCanonical(value, catalog, { partial: true })?.canonical || null;
}"""
text = text.replace(old_regions, new_regions)
write(path, text)

# Generic location entries retain name for compatibility but gain canonical/type identity.
path = 'src/location-merge.js'
text = read(path)
text = text.replace(
    "return Object.freeze({ name, aliases: Object.freeze(all), re: aliasesToRegex(all) });",
    "return Object.freeze({ canonical: name, name, aliases: Object.freeze(all), re: aliasesToRegex(all) });",
)
text = text.replace(
    "return Object.freeze({ ...base, aliases: Object.freeze(aliases), re: aliasesToRegex(aliases) });",
    "return Object.freeze({ ...base, canonical: base.canonical || base.name, type: base.type || base.entityType, aliases: Object.freeze(aliases), re: aliasesToRegex(aliases) });",
)
write(path, text)

path = 'src/locations.js'
text = read(path)
text = text.replace(
    "return Object.freeze({ name, aliases: Object.freeze(all), re: aliasesToRegex(all) });",
    "return Object.freeze({ canonical: name, name, aliases: Object.freeze(all), re: aliasesToRegex(all) });",
)
text = text.replace(
    "return Object.freeze({ name: item.canonical, aliases: Object.freeze(all), re: aliasesToRegex(all) });",
    "return Object.freeze({ canonical: item.canonical, name: item.canonical, type: item.type, country: item.country, city: item.city, aliases: Object.freeze(all), re: aliasesToRegex(all) });",
)
write(path, text)

for path in [
    'src/kz-location-extensions.js',
    'src/uz-location-extensions.js',
    'src/ua-location-extensions-major.js',
    'src/ua-location-extensions-regional.js',
]:
    text = read(path)
    text = text.replace(
        "return Object.freeze({ ...meta, name, aliases: Object.freeze(all), re: aliasesToRegex(all) });",
        "return Object.freeze({ ...meta, canonical: name, name, type: meta.type || meta.entityType, aliases: Object.freeze(all), re: aliasesToRegex(all) });",
    )
    write(path, text)

# ---------- Public TypeScript contract ----------
path = 'index.d.ts'
text = read(path)
if text.startswith('export type AliasMap ='):
    text = text.replace(
        'export type AliasMap = Readonly<Record<string, readonly string[]>>;\n',
        "export type LexiconLanguage = 'ru' | 'en' | 'uk' | 'ro' | 'uzLatn' | 'uzCyrl' | 'kk';\nexport type CountryCode = 'UZ' | 'KZ' | 'UA' | 'RO' | 'KG';\nexport type AliasMap = Readonly<Partial<Record<LexiconLanguage, readonly string[]>>>;\n",
        1,
    )
text = text.replace('country?: string;', 'country?: CountryCode;')
text = text.replace('export const TASHKENT_METRO_BY_NAME: Map<string, MetroStation>;\n', '')
text = text.replace(
    'export type MetroStation = Readonly<{\n  name: string;',
    "export type MetroStation = Readonly<{\n  canonical: string;\n  name: string;\n  type: 'metro';\n  country: 'UZ';\n  city: 'Tashkent';",
)
text = text.replace(
    'export type LocationEntry = Readonly<{\n  name: string;',
    'export type LocationEntry = Readonly<{\n  canonical: string;\n  name: string;\n  type?: string;',
)
if 'export type CanonicalMatch<' not in text:
    anchor = 'export type ProfessionEntry = Readonly<{'
    addition = """export type CanonicalMatch<T> = Readonly<{
  entry: T;
  canonical: string | null;
  alias: string;
  sourceAlias: string;
  normalizedAlias: string;
  start: number;
  end: number;
}>;
export type LexiconValidationIssue = Readonly<{ kind: string; [key: string]: unknown }>;
export type LexiconValidationReport = Readonly<{ ok: boolean; errors: readonly LexiconValidationIssue[] }>;

"""
    text = text.replace(anchor, addition + anchor)
if 'export const LEXICON_LANGUAGES' not in text:
    anchor = 'export function normalizeUnicode(value: unknown): string;'
    addition = """export const LEXICON_LANGUAGES: readonly LexiconLanguage[];
export const COUNTRY_CODES: readonly CountryCode[];
export function deepFreeze<T>(value: T): T;
export function freezeAliases(aliases?: AliasMap | readonly string[]): AliasMap | readonly string[];
export function lexiconEntity(canonical: string, aliases?: AliasMap, extra?: Record<string, unknown>): LexiconEntity;

"""
    text = text.replace(anchor, addition + anchor)
if 'export function findAllCanonical' not in text:
    anchor = 'export function collectAliasCollisions'
    addition = "export function getAliasOwnersIndex<T>(entries: readonly T[], options?: { transliteration?: boolean }): Map<string, readonly unknown[]>;\nexport function findAllCanonical<T extends { canonical?: string; name?: string; aliases?: AliasMap | readonly string[] }>(value: unknown, entries: readonly T[], options?: { transliteration?: boolean }): readonly CanonicalMatch<T>[];\nexport function validateLexicon(entries: readonly unknown[], options?: { allowedCollisions?: readonly string[]; allowedLanguageKeys?: readonly LexiconLanguage[]; allowDuplicateCanonicals?: boolean }): LexiconValidationReport;\nexport function assertValidLexicon(entries: readonly unknown[], options?: { allowedCollisions?: readonly string[]; allowedLanguageKeys?: readonly LexiconLanguage[]; allowDuplicateCanonicals?: boolean }): true;\n"
    text = text.replace(anchor, addition + anchor)
text = text.replace('export function canonicalCity(value: unknown, country?: string | null): string | null;', 'export function canonicalCity(value: unknown, country?: CountryCode | null): string | null;')
text = text.replace('export function canonicalAnyCity(value: unknown, country?: string | null): string | null;', 'export function canonicalAnyCity(value: unknown, country?: CountryCode | null): string | null;')
text = text.replace('export function canonicalRegion(value: unknown, country?: string | null): string | null;', 'export function canonicalRegion(value: unknown, country?: CountryCode | null): string | null;')
if 'export function tashkentMetroStation' not in text:
    text = text.replace('export function canonicalTashkentMetro(value: unknown): string | null;', 'export function tashkentMetroStation(value: unknown): MetroStation | null;\nexport function canonicalTashkentMetro(value: unknown): string | null;')
if 'export const CITIES_BY_COUNTRY' not in text:
    text = text.replace('export const CITIES: readonly LexiconEntity[];', 'export const CITIES: readonly LexiconEntity[];\nexport const CITIES_BY_COUNTRY: Readonly<Record<string, readonly LexiconEntity[]>>;')
if 'export const GEOGRAPHY_CITIES_BY_COUNTRY' not in text:
    text = text.replace('export const GEOGRAPHY_CITIES: readonly LexiconEntity[];', 'export const GEOGRAPHY_CITIES: readonly LexiconEntity[];\nexport const GEOGRAPHY_CITIES_BY_COUNTRY: Readonly<Record<string, readonly LexiconEntity[]>>;')
if 'export const REGIONS_BY_COUNTRY' not in text:
    text = text.replace('export const REGIONS: readonly LexiconEntity[];', 'export const REGIONS: readonly LexiconEntity[];\nexport const REGIONS_BY_COUNTRY: Readonly<Record<string, readonly LexiconEntity[]>>;')
write(path, text)

# ---------- Invariant regressions (written now, run only in final CI) ----------
Path('test/runtime-invariants.test.js').write_text(r"""import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/index.js';
import {
  aliasesToRegex,
  findAllCanonical,
  getAliasIndex,
  lexiconEntity,
  validateLexicon,
} from '../src/index.js';

test('lexiconEntity deep-freezes alias arrays', () => {
  const item = lexiconEntity('example', { en: ['Example'], ru: ['Пример'] });
  assert.equal(Object.isFrozen(item), true);
  assert.equal(Object.isFrozen(item.aliases), true);
  assert.equal(Object.isFrozen(item.aliases.en), true);
  assert.throws(() => item.aliases.en.push('mutate'), TypeError);
});

test('cached alias index is reused for immutable lexicons', () => {
  const entries = Object.freeze([
    lexiconEntity('alpha', { en: ['Alpha'] }),
    lexiconEntity('beta', { en: ['Beta'] }),
  ]);
  assert.equal(getAliasIndex(entries), getAliasIndex(entries));
});

test('findAllCanonical returns every entity with offsets', () => {
  const entries = Object.freeze([
    lexiconEntity('en', { en: ['English'] }),
    lexiconEntity('ru', { en: ['Russian'] }),
  ]);
  const text = 'English required, Russian preferred';
  const matches = findAllCanonical(text, entries, { transliteration: false });
  assert.deepEqual(matches.map(({ canonical }) => canonical), ['en', 'ru']);
  assert.equal(text.slice(matches[0].start, matches[0].end), 'English');
  assert.equal(text.slice(matches[1].start, matches[1].end), 'Russian');
});

test('validator catches duplicate and cross-canonical aliases', () => {
  const report = validateLexicon(Object.freeze([
    lexiconEntity('owner', { kk: ['делдалсыз', 'делдалсыз'] }),
    lexiconEntity('noCommission', { kk: ['делдалсыз'] }),
  ]));
  assert.equal(report.ok, false);
  assert.ok(report.errors.some(({ kind }) => kind === 'duplicateAlias'));
  assert.ok(report.errors.some(({ kind }) => kind === 'crossCanonicalCollision'));
});

test('aliasesToRegex rejects an empty public alias list', () => {
  assert.throws(() => aliasesToRegex([]), TypeError);
});

test('public Tashkent metro API does not expose a mutable Map', () => {
  assert.equal('TASHKENT_METRO_BY_NAME' in api, false);
  assert.equal(api.tashkentMetroStation('Minor')?.canonical, 'Minor');
});

test('Tashkent geo entities carry their own parent identity', () => {
  const district = api.TASHKENT_DISTRICTS.find(({ canonical }) => canonical === 'Yunusabad');
  const metro = api.TASHKENT_METRO.find(({ canonical }) => canonical === 'Minor');
  assert.deepEqual({ type: district.type, country: district.country, city: district.city }, { type: 'district', country: 'UZ', city: 'Tashkent' });
  assert.deepEqual({ type: metro.type, country: metro.country, city: metro.city }, { type: 'metro', country: 'UZ', city: 'Tashkent' });
});
""")
