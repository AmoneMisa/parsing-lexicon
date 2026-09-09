#!/usr/bin/env node
/**
 * Projects approved geo-catalog map entities into the lexical owner.
 * Spatial fields deliberately never enter the generated lexicon module.
 */
import { mkdir, writeFile } from 'node:fs/promises';
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

function parseArgs(argv) {
  const options = {
    country: 'UZ',
    geoSource: resolve(dirname(fileURLToPath(import.meta.url)), '../../geo-catalog/data-source/uz/map-data.js'),
    output: resolve(dirname(fileURLToPath(import.meta.url)), '../src/uz-map-data-location-extensions.js'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[++index];
    if (!value || !key?.startsWith('--')) fail('expected optional --geo-source and --output paths');
    if (key === '--geo-source') options.geoSource = resolve(value);
    else if (key === '--output') options.output = resolve(value);
    else fail(`unknown argument ${key}`);
  }
  return options;
}

const options = parseArgs(process.argv.slice(2));
const geoModule = await import(pathToFileURL(options.geoSource));
const entities = geoModule.UZ_MAP_DATA_ENTITIES;
if (!Array.isArray(entities)) fail('geo source must export UZ_MAP_DATA_ENTITIES');

const cities = new Map(Object.keys(LOCATION_DICTIONARIES.UZ || {}).map((city) => [cityKey(city), city]));
const grouped = new Map();
for (const entity of entities) {
  const collection = TYPE_TO_COLLECTION[entity.type];
  const city = cities.get(cityKey(String(entity.parentId || '').split(':')[1]));
  if (!collection || !city || !entity.canonicalName) continue;
  const cityData = grouped.get(city) || new Map();
  const entries = cityData.get(collection) || new Map();
  const aliases = [...new Set((entity.sourceNames?.canonical || []).filter((name) => name && name !== entity.canonicalName))];
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

const source = `// Generated from approved geo-catalog UZ map-data entities. Names only; coordinates remain in geo-catalog.\nimport { locationEntries } from './location-merge.js';\n\nexport const UZ_MAP_DATA_LOCATION_EXTENSIONS = Object.freeze(\n  Object.fromEntries(Object.entries(${JSON.stringify(output, null, 2)}).map(([city, collections]) => [city, Object.freeze(\n    Object.fromEntries(Object.entries(collections).map(([collection, rows]) => [collection, locationEntries(rows)])),\n  )])),\n);\n`;
await mkdir(dirname(options.output), { recursive: true });
await writeFile(options.output, source);
const count = entities.filter((entity) => TYPE_TO_COLLECTION[entity.type]).length;
console.log(`Wrote ${count} UZ lexical map-data entries to ${options.output}`);
