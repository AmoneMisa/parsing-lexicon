import {
  LOCATION_DICTIONARIES as BASE_LOCATION_DICTIONARIES,
  UA_REGION_ENTRIES,
  UA_SECONDARY_CITIES,
  matchUkraineRegion,
  matchUkraineSecondaryCity,
} from './locations.js';
import { LOCATION_LIST_KEYS, mergeLocationCountries } from './location-merge.js';
import { KG_LOCATION_EXTENSIONS } from './kg-location-extensions.js';
import { KG_OSH_LOCATION_EXTENSIONS } from './kg-osh-location-extensions.js';
import { KG_KARAKOL_LOCATION_EXTENSIONS } from './kg-karakol-location-extensions.js';
import { KZ_DISTRICT_EXTENSIONS } from './kz-district-extensions.js';
import { KZ_SCRAPED_ADDRESS_EXTENSIONS as KZ_ADDRESS_EXTENSIONS } from './kz-address-extensions.js';
import { KZ_SCRAPED_TAIL_ADDRESS_EXTENSIONS as KZ_REGIONAL_ADDRESS_EXTENSIONS } from './kz-regional-address-extensions.js';
import { KZ_SCRAPED_LOCATION_EXTENSIONS as KZ_RESIDENTIAL_EXTENSIONS } from './kz-residential-extensions.js';
import { KZ_SCRAPED_SECONDARY_LOCATION_EXTENSIONS as KZ_REGIONAL_RESIDENTIAL_EXTENSIONS } from './kz-regional-residential-extensions.js';
import { KZ_KOSTANAY_LOCATION_EXTENSIONS } from './kz-kostanay-location-extensions.js';
import { KZ_PAVLODAR_LOCATION_EXTENSIONS } from './kz-pavlodar-location-extensions.js';
import { UA_RESIDENTIAL_EXTENSIONS } from './ua-residential-extensions.js';
import { UZ_TASHKENT_CONTEXT_EXTENSIONS } from './uz-tashkent-context-extensions.js';
import { UZ_SAMARKAND_CONTEXT_EXTENSIONS } from './uz-samarkand-context-extensions.js';
import { UZ_BUKHARA_LOCATION_EXTENSIONS } from './uz-bukhara-location-extensions.js';

export { UA_REGION_ENTRIES, UA_SECONDARY_CITIES, matchUkraineRegion, matchUkraineSecondaryCity };

export const LOCATION_DICTIONARIES = Object.freeze({
  ...BASE_LOCATION_DICTIONARIES,
  UA: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.UA || {},
    UA_RESIDENTIAL_EXTENSIONS,
  ),
  UZ: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.UZ || {},
    UZ_TASHKENT_CONTEXT_EXTENSIONS,
    UZ_SAMARKAND_CONTEXT_EXTENSIONS,
    UZ_BUKHARA_LOCATION_EXTENSIONS,
  ),
  KZ: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.KZ || {},
    KZ_DISTRICT_EXTENSIONS,
    KZ_RESIDENTIAL_EXTENSIONS,
    KZ_REGIONAL_RESIDENTIAL_EXTENSIONS,
    KZ_ADDRESS_EXTENSIONS,
    KZ_REGIONAL_ADDRESS_EXTENSIONS,
    KZ_KOSTANAY_LOCATION_EXTENSIONS,
    KZ_PAVLODAR_LOCATION_EXTENSIONS,
  ),
  KG: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.KG || {},
    KG_LOCATION_EXTENSIONS,
    KG_OSH_LOCATION_EXTENSIONS,
    KG_KARAKOL_LOCATION_EXTENSIONS,
  ),
});

export function dictionaryFor(countryCode, city) {
  return LOCATION_DICTIONARIES[countryCode]?.[city] || null;
}

export function locationCities(countryCode) {
  return LOCATION_DICTIONARIES[countryCode] || Object.freeze({});
}

export function matchDictionaryLocation(text, countryCode, city = null) {
  const country = locationCities(countryCode);
  const cities = city && country[city] ? [[city, country[city]]] : Object.entries(country);
  const value = String(text || '');
  let best = null;

  for (const [cityName, data] of cities) {
    for (const type of LOCATION_LIST_KEYS) {
      for (const entry of data[type] || []) {
        const match = entry?.re?.exec(value);
        if (!match) continue;
        const start = match.index;
        const end = start + match[0].length;
        const containsBest = best && start <= best.start && end >= best.end && end - start > best.end - best.start;
        if (best && !containsBest) continue;
        best = { city: cityName, type, name: entry.name, aliases: entry.aliases, start, end };
      }
    }
  }

  if (!best) return null;
  const { start: _start, end: _end, ...result } = best;
  return result;
}
