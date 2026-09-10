#!/usr/bin/env node
/** Fails when approved geo map data has no same-city lexical representation. */
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import { LOCATION_DICTIONARIES } from '../src/locations.js';

const TYPE_TO_COLLECTION = Object.freeze({
  street: 'streets',
  local_area: 'localAreas',
  residential_complex: 'residentialComplexes',
  mahalla: 'mahallas',
});

function cityKey(value) { return String(value).toLocaleLowerCase().replace(/[ -]/g, ''); }
function entityExport(country) { return `${country}_MAP_DATA_ENTITIES`; }

const options = { country: 'UZ', geoSource: null };
for (let index = 0; index < process.argv.length - 2; index += 2) {
  const key = process.argv[index + 2];
  const value = process.argv[index + 3];
  if (!key?.startsWith('--') || !value) throw new Error('Geo lexicon audit: optional usage is --country <ISO-2> --geo-source <path>');
  if (key === '--country') options.country = value.toUpperCase();
  else if (key === '--geo-source') options.geoSource = resolve(value);
  else throw new Error(`Geo lexicon audit: unknown option ${key}`);
}
if (!/^[A-Z]{2}$/.test(options.country)) throw new Error('Geo lexicon audit: --country must be an ISO-2 code');
const geoSource = options.geoSource || resolve(dirname(fileURLToPath(import.meta.url)), `../../geo-catalog/data-source/${options.country.toLowerCase()}/map-data.js`);
const module = await import(pathToFileURL(resolve(geoSource)));
const entities = module[entityExport(options.country)];
if (!Array.isArray(entities)) throw new Error(`Geo lexicon audit: geo source must export ${entityExport(options.country)}`);

const cityDictionary = LOCATION_DICTIONARIES[options.country] || {};
const cities = new Map(Object.keys(cityDictionary).map((city) => [cityKey(city), city]));
const gaps = [];
for (const entity of entities) {
  const collection = TYPE_TO_COLLECTION[entity.type];
  if (!collection) continue;
  const city = cities.get(cityKey(String(entity.parentId || '').split(':')[1]));
  const entries = cityDictionary[city]?.[collection] || [];
  if (!entries.some((entry) => entry.name === entity.canonicalName || entry.aliases?.includes(entity.canonicalName))) {
    gaps.push(entity.id);
  }
}
if (gaps.length) throw new Error(`Geo lexicon audit: ${gaps.length} ${options.country} map-data entities are missing from the lexicon: ${gaps.slice(0, 10).join(', ')}`);
console.log(`Geo lexicon audit passed: ${entities.length} approved ${options.country} map-data entities have city/type-compatible lexical entries.`);
