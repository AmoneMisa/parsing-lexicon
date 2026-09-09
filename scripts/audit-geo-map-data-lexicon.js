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
const supplied = process.argv.slice(2);
if (supplied.length > 2 || (supplied.length && supplied[0] !== '--geo-source') || (supplied.length === 2 && !supplied[1])) {
  throw new Error('Geo lexicon audit: optional usage is --geo-source <path>');
}
const geoSource = supplied[1] || resolve(dirname(fileURLToPath(import.meta.url)), '../../geo-catalog/data-source/uz/map-data.js');
const { UZ_MAP_DATA_ENTITIES: entities } = await import(pathToFileURL(resolve(geoSource)));
if (!Array.isArray(entities)) throw new Error('Geo lexicon audit: geo source must export UZ_MAP_DATA_ENTITIES');

const cities = new Map(Object.keys(LOCATION_DICTIONARIES.UZ || {}).map((city) => [cityKey(city), city]));
const gaps = [];
for (const entity of entities) {
  const collection = TYPE_TO_COLLECTION[entity.type];
  if (!collection) continue;
  const city = cities.get(cityKey(String(entity.parentId || '').split(':')[1]));
  const entries = LOCATION_DICTIONARIES.UZ?.[city]?.[collection] || [];
  if (!entries.some((entry) => entry.name === entity.canonicalName || entry.aliases?.includes(entity.canonicalName))) {
    gaps.push(entity.id);
  }
}
if (gaps.length) throw new Error(`Geo lexicon audit: ${gaps.length} UZ map-data entities are missing from the lexicon: ${gaps.slice(0, 10).join(', ')}`);
console.log(`Geo lexicon audit passed: ${entities.length} approved UZ map-data entities have city/type-compatible lexical entries.`);
