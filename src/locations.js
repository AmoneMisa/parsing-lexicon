import {
  LOCATION_DICTIONARIES as BASE_LOCATION_DICTIONARIES,
  UA_EXTRA_LOCATION_DICTIONARIES,
  UA_REGION_ENTRIES,
  UA_SECONDARY_CITIES,
  matchUkraineRegion,
  matchUkraineSecondaryCity,
} from './location-data.js';
import { mergeLocationCountries } from './location-merge.js';
import { KZ_LOCATION_EXTENSIONS } from './kz-location-extensions.js';
import { UZ_LOCATION_EXTENSIONS } from './uz-location-extensions.js';
import { UA_MAJOR_LOCATION_EXTENSIONS } from './ua-location-extensions-major.js';
import { UA_REGIONAL_LOCATION_EXTENSIONS } from './ua-location-extensions-regional.js';
import { UA_SECONDARY_LOCATION_EXTENSIONS } from './ua-secondary-cities.js';
import { UA_METRO_LOCATION_EXTENSIONS } from './ua-location-extensions-metro.js';

const UA_LEGACY_LOCATION_ADDITIONS = Object.freeze({
  ...UA_EXTRA_LOCATION_DICTIONARIES,
  Zaporizhzhia: Object.freeze({
    ...UA_EXTRA_LOCATION_DICTIONARIES.Zaporizhzhia,
    districts: Object.freeze(
      (UA_EXTRA_LOCATION_DICTIONARIES.Zaporizhzhia?.districts || [])
        .filter(({ name }) => name !== 'Komunarskyi'),
    ),
  }),
});

const COUNTRY_LOCATION_DICTIONARIES = Object.freeze({
  ...BASE_LOCATION_DICTIONARIES,
  KZ: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.KZ || {},
    KZ_LOCATION_EXTENSIONS,
  ),
  UZ: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.UZ || {},
    UZ_LOCATION_EXTENSIONS,
  ),
  UA: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.UA || {},
    UA_LEGACY_LOCATION_ADDITIONS,
    UA_MAJOR_LOCATION_EXTENSIONS,
    UA_REGIONAL_LOCATION_EXTENSIONS,
    UA_SECONDARY_LOCATION_EXTENSIONS,
    UA_METRO_LOCATION_EXTENSIONS,
  ),
});

/** Canonical country -> city -> location dictionary registry. */
export const LOCATION_DICTIONARIES = COUNTRY_LOCATION_DICTIONARIES;

// Compatibility exports. Legacy seeds are not canonical ownership; consumers
// should use LOCATION_DICTIONARIES/locationCities().
export {
  UA_EXTRA_LOCATION_DICTIONARIES,
  UA_REGION_ENTRIES,
  UA_SECONDARY_CITIES,
  matchUkraineRegion,
  matchUkraineSecondaryCity,
};

export function dictionaryFor(countryCode, city) {
  return LOCATION_DICTIONARIES[countryCode]?.[city] || null;
}

export function locationCities(countryCode) {
  return LOCATION_DICTIONARIES[countryCode] || Object.freeze({});
}

export function matchDictionaryLocation(text, countryCode, city = null) {
  const country = locationCities(countryCode);
  const cities = city && country[city] ? [[city, country[city]]] : Object.entries(country);
  for (const [cityName, data] of cities) {
    for (const type of ['districts', 'microdistricts', 'residentialComplexes', 'metro', 'streets', 'landmarks']) {
      const match = (data[type] || []).find((entry) => entry.re.test(String(text || '')));
      if (match) return { city: cityName, type, name: match.name, aliases: match.aliases };
    }
  }
  return null;
}
