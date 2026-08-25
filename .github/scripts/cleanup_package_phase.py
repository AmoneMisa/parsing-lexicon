from pathlib import Path
import json
import re


def read(path):
    return Path(path).read_text()


def write(path, text):
    Path(path).write_text(text)


def ensure_import(text, line):
    if line in text:
        return text
    matches = list(re.finditer(r'^import .*?;\n', text, re.M))
    if matches:
        pos = matches[-1].end()
        return text[:pos] + line + '\n' + text[pos:]
    return line + '\n' + text

# 1. Regions must not inherit the city type from the bulk identity migration.
path = 'src/geography.js'
text = read(path)
marker = 'export const UA_REGIONS = Object.freeze(['
if marker in text:
    before, after = text.split(marker, 1)
    after = after.replace("type: 'city'", "type: 'region'")
    text = before + marker + after
write(path, text)

# 2. DEAL_TYPES has one canonical owner: housing-intent.js. Action verbs stay out.
path = 'src/housing.js'
text = read(path)
text = ensure_import(text, "import { HOUSING_DEAL_TYPES } from './housing-intent.js';")
text = re.sub(
    r"export const DEAL_TYPES = Object\.freeze\(\[.*?\]\);\n\n/\*\* Occupancy is orthogonal",
    "export const DEAL_TYPES = HOUSING_DEAL_TYPES;\n\n/** Occupancy is orthogonal",
    text,
    count=1,
    flags=re.S,
)
write(path, text)

# 3. Resolve negative floor constraints over overlapping positive phrases.
path = 'src/housing-context.js'
text = read(path)
anchor = "const statusPriority = Object.freeze(['sold', 'rented', 'reserved', 'closed', 'outdated', 'active']);\n"
helper = """
function resolveFloorConstraints(text) {
  const values = all(text, FLOOR_CONSTRAINT_TERMS);
  const out = new Set(values);
  if (out.has('notFirst')) out.delete('first');
  if (out.has('notLast')) out.delete('last');
  return [...out];
}
"""
if helper.strip() not in text:
    text = text.replace(anchor, anchor + helper)
text = text.replace('floorConstraints: all(text, FLOOR_CONSTRAINT_TERMS),', 'floorConstraints: resolveFloorConstraints(text),')
write(path, text)

# 4. Tashkent Medical Academy is one physical POI referenced by two groups.
path = 'src/tashkent-pois.js'
text = read(path)
text = text.replace(
    "    category,\n    aliases: Object.freeze(all),",
    "    category,\n    categories: Object.freeze([...new Set([category, ...(options.categories || [])])]),\n    aliases: Object.freeze(all),",
    1,
)
tma_decl = "const TASHKENT_MEDICAL_ACADEMY = poi('Tashkent Medical Academy', 'university', ['ТМА', 'Ташкентская медицинская академия'], { categories: ['medical'] });\n\n"
if tma_decl not in text:
    text = text.replace('export const TASHKENT_UNIVERSITIES = Object.freeze([', tma_decl + 'export const TASHKENT_UNIVERSITIES = Object.freeze([')
text = text.replace("  poi('Tashkent Medical Academy', 'university', ['ТМА', 'Ташкентская медицинская академия']),", '  TASHKENT_MEDICAL_ACADEMY,')
text = text.replace("  poi('Tashkent Medical Academy', 'medical', ['Ташкентская медицинская академия', 'ТМА']),", '  TASHKENT_MEDICAL_ACADEMY,')
text = text.replace("  const key = `${entry.category}:${entry.name}`;", "  const key = entry.name;")
write(path, text)

# 5. Root type API re-exports the two contextual modules; intent gets a typed subpath.
path = 'index.d.ts'
text = read(path)
text = text.replace(
    'export type AreaEntry = Readonly<{ name: string; aliases: readonly string[] }>;',
    "export type AreaEntry = Readonly<{ canonical: string; name: string; type: 'local_area'; country: 'UZ'; city: 'Tashkent'; aliases: readonly string[] }>;",
)
text = text.replace(
    '  category: string;\n  aliases: readonly string[];',
    '  category: string;\n  categories?: readonly string[];\n  aliases: readonly string[];',
    1,
)
for line in ["export * from './src/housing-context.js';", "export * from './src/hiring-context.js';", "export * from './src/housing-intent.js';"]:
    if line not in text:
        text += '\n' + line
write(path, text)

Path('src/housing-intent.d.ts').write_text("""export type HousingAction = 'sell' | 'buy' | 'rentOut' | 'rentIn';
export type HousingListingKind = 'propertyOffer' | 'propertyWanted';
export type HousingDealType = 'sale' | 'longRent' | 'shortRent';
export type HousingIntentResult = Readonly<{ action: HousingAction; listingKind: HousingListingKind; dealType: HousingDealType }>;
export const HOUSING_ACTIONS: readonly unknown[];
export const HOUSING_INTENT: readonly unknown[];
export const HOUSING_DEAL_TYPES: readonly unknown[];
export const HOUSING_ACTION_MAP: Readonly<Record<HousingAction, Readonly<{ listingKind: HousingListingKind; dealType: Exclude<HousingDealType, 'shortRent'> }>>>;
export function resolveHousingIntent(value: unknown): HousingIntentResult | null;
""")

pkg = json.loads(read('package.json'))
pkg['exports']['./housing-intent'] = {
    'types': './src/housing-intent.d.ts',
    'import': './src/housing-intent.js',
}
write('package.json', json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')

# 6. Remove obsolete diagnostic workflows; the current phase runner is removed at final cleanup.
for obsolete in ['.github/workflows/apply-final-regression-fixes.yml', '.github/workflows/debug-central-asia.yml']:
    p = Path(obsolete)
    if p.exists():
        p.unlink()

# Tests are only authored here; user requested one test pass after implementation is complete.
Path('test/package-cleanup.test.js').write_text(r"""import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/index.js';

test('deal type vocabulary no longer decides transaction side', () => {
  assert.equal(api.findCanonical('куплю квартиру', api.DEAL_TYPES, { partial: true }), null);
  assert.equal(api.findCanonical('сниму квартиру', api.DEAL_TYPES, { partial: true }), null);
  assert.equal(api.resolveHousingIntent('куплю квартиру')?.listingKind, 'propertyWanted');
  assert.equal(api.resolveHousingIntent('сдам квартиру')?.listingKind, 'propertyOffer');
});

test('region entities are typed as regions', () => {
  assert.equal(api.UA_REGIONS.find(({ canonical }) => canonical === 'Kyiv Oblast')?.type, 'region');
  assert.equal(api.KZ_REGIONS.find(({ canonical }) => canonical === 'Almaty Region')?.type, 'region');
});

test('negative floor constraints suppress overlapping positive match', () => {
  const parsed = api.parseHousingContext('Ищу квартиру: не первый и не последний этаж');
  assert.deepEqual(new Set(parsed.floorConstraints), new Set(['notFirst', 'notLast']));
});

test('Tashkent physical POIs are unique after group flattening', () => {
  const names = api.TASHKENT_LANDMARKS.map(({ name }) => name);
  assert.equal(names.length, new Set(names).size);
  const tma = api.TASHKENT_LANDMARKS.filter(({ name }) => name === 'Tashkent Medical Academy');
  assert.equal(tma.length, 1);
  assert.ok(tma[0].categories.includes('medical'));
  assert.ok(tma[0].categories.includes('university'));
});
""")
