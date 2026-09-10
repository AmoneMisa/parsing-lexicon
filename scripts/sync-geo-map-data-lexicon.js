#!/usr/bin/env node
/**
 * Projects approved geo-catalog map entities into the lexical owner.
 * Spatial fields deliberately never enter the generated lexicon module.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { LOCATION_DICTIONARIES } from '../src/locations.js';

const TYPE_TO_COLLECTION = Object.freeze({
  street: 'streets',
  local_area: 'localAreas',
  residential_complex: 'residentialComplexes',
  mahalla: 'mahallas',
});

function fail(message) { throw new Error(`Geo lexicon sync: ${message}`); }
function cityKey(value) { return String(value).toLocaleLowerCase().replace(/[ -]/g, ''); }
function entityExport(country) { return `${country}_MAP_DATA_ENTITIES`; }
function lexicalExport(country) { return `${country}_MAP_DATA_LOCATION_EXTENSIONS`; }

function parseCsv(source) {
  const rows = [];
  let row = []; let value = ''; let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') { row.push(value); value = ''; }
    else if (character === '\n') { row.push(value.replace(/\r$/u, '')); rows.push(row); row = []; value = ''; }
    else value += character;
  }
  if (quoted) fail('translation CSV has an unterminated quoted value');
  if (value || row.length) { row.push(value.replace(/\r$/u, '')); rows.push(row); }
  const [header = [], ...body] = rows;
  const columns = new Map(header.map((name, index) => [name.replace(/^\uFEFF/u, ''), index]));
  for (const required of ['country', 'city', 'type', 'osm', 'translation_russian', 'translation_english']) {
    if (!columns.has(required)) fail(`translation CSV is missing ${required}`);
  }
  return body.filter((fields) => fields.some(Boolean)).map((fields) => Object.fromEntries([...columns.entries()].map(([name, index]) => [name, fields[index] || ''])));
}

function translationAliases(rows, country) {
  const aliasesByOsm = new Map();
  for (const row of rows) {
    if (row.country.toUpperCase() !== country) continue;
    const aliases = [
      ...row.translation_russian.split('|').map((value) => value.trim()).filter((value) => /[А-Яа-яЁё]/u.test(value)),
      ...row.translation_english.split('|').map((value) => value.trim()).filter((value) => /[A-Za-z]/u.test(value)),
    ];
    if (!aliases.length) continue;
    if (aliases.some((value) => /[\r\n<>]/u.test(value))) fail(`translation for ${row.osm} has unsafe characters`);
    for (const osm of row.osm.split(';').map((value) => value.trim()).filter(Boolean)) {
      const current = aliasesByOsm.get(osm) || new Set();
      aliases.forEach((alias) => current.add(alias));
      aliasesByOsm.set(osm, current);
    }
  }
  return aliasesByOsm;
}

function parseArgs(argv) {
  const options = {
    country: 'UZ',
    geoSource: null,
    output: null,
    translations: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[++index];
    if (!value || !key?.startsWith('--')) fail('expected optional --country, --geo-source, --output and --translations paths');
    if (key === '--country') options.country = value.toUpperCase();
    else if (key === '--geo-source') options.geoSource = resolve(value);
    else if (key === '--output') options.output = resolve(value);
    else if (key === '--translations') options.translations = resolve(value);
    else fail(`unknown argument ${key}`);
  }
  return options;
}

const options = parseArgs(process.argv.slice(2));
if (!/^[A-Z]{2}$/.test(options.country)) fail('--country must be an ISO-2 code');
options.geoSource ||= resolve(dirname(fileURLToPath(import.meta.url)), `../../geo-catalog/data-source/${options.country.toLowerCase()}/map-data.js`);
options.output ||= resolve(dirname(fileURLToPath(import.meta.url)), `../src/${options.country.toLowerCase()}-map-data-location-extensions.js`);
options.translations ||= resolve(dirname(fileURLToPath(import.meta.url)), '../src/map-data-approved-label-translations.csv');
const geoModule = await import(pathToFileURL(options.geoSource));
const entities = geoModule[entityExport(options.country)];
if (!Array.isArray(entities)) fail(`geo source must export ${entityExport(options.country)}`);
const approvedAliasesByOsm = options.translations
  ? translationAliases(parseCsv(await readFile(options.translations, 'utf8')), options.country)
  : new Map();

const cityDictionary = LOCATION_DICTIONARIES[options.country] || {};
const cities = new Map(Object.keys(cityDictionary).map((city) => [cityKey(city), city]));
for (const entity of entities) {
  const slug = String(entity.parentId || '').split(':')[1];
  if (slug && !cities.has(cityKey(slug))) cities.set(cityKey(slug), slug.replace(/(^|[- ])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`));
}
const grouped = new Map();
for (const entity of entities) {
  const collection = TYPE_TO_COLLECTION[entity.type];
  const city = cities.get(cityKey(String(entity.parentId || '').split(':')[1]));
  if (!collection || !city || !entity.canonicalName) continue;
  const cityData = grouped.get(city) || new Map();
  const entries = cityData.get(collection) || new Map();
  const identities = entity.concordances?.osm || [entity.osm];
  const translatedAliases = identities.flatMap((osm) => [...(approvedAliasesByOsm.get(`${osm.type}:${osm.id}`) || [])]);
  const aliases = [...new Set([...entity.sourceNames?.canonical || [], ...translatedAliases]
    .filter((name) => name && name !== entity.canonicalName))];
  const key = entity.canonicalName.toLocaleLowerCase();
  const current = entries.get(key);
  entries.set(key, current
    ? { name: current.name, aliases: [...new Set([...current.aliases, ...aliases])].sort((a, b) => a.localeCompare(b)) }
    : { name: entity.canonicalName, aliases: aliases.sort((a, b) => a.localeCompare(b)) });
  cityData.set(collection, entries);
  grouped.set(city, cityData);
}

const output = Object.fromEntries([...grouped.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([city, collections]) => [city, Object.fromEntries([...collections.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([collection, rows]) => [collection, [...rows.values()]
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(({ name, aliases }) => [name, ...aliases])]))]));

const source = `// Generated from approved geo-catalog ${options.country} map-data entities. Names only; coordinates remain in geo-catalog.\nimport { locationEntries } from './location-merge.js';\n\nexport const ${lexicalExport(options.country)} = Object.freeze(\n  Object.fromEntries(Object.entries(${JSON.stringify(output, null, 2)}).map(([city, collections]) => [city, Object.freeze(\n    Object.fromEntries(Object.entries(collections).map(([collection, rows]) => [collection, locationEntries(rows)])),\n  )])),\n);\n`;
await mkdir(dirname(options.output), { recursive: true });
await writeFile(options.output, source);
const count = entities.filter((entity) => TYPE_TO_COLLECTION[entity.type]).length;
console.log(`Wrote ${count} ${options.country} lexical map-data entries to ${options.output}`);
