import {
  LOCATION_DICTIONARIES as BASE_LOCATION_DICTIONARIES,
  UA_REGION_ENTRIES,
  UA_SECONDARY_CITIES,
  matchUkraineRegion,
  matchUkraineSecondaryCity,
} from './locations.js';
import { LOCATION_LIST_KEYS, mergeLocationCountries } from './location-merge.js';
import { KG_LOCATION_EXTENSIONS } from './kg-location-extensions.js';

export { UA_REGION_ENTRIES, UA_SECONDARY_CITIES, matchUkraineRegion, matchUkraineSecondaryCity };

export const LOCATION_DICTIONARIES = Object.freeze({
  ...BASE_LOCATION_DICTIONARIES,
  KG: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.KG || {},
    KG_LOCATION_EXTENSIONS,
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
