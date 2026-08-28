import {
  LOCATION_DICTIONARIES as BASE_LOCATION_DICTIONARIES,
  UA_EXTRA_LOCATION_DICTIONARIES as RAW_UA_EXTRA_LOCATION_DICTIONARIES,
  UA_REGION_ENTRIES,
  UA_SECONDARY_CITIES,
  matchUkraineRegion,
  matchUkraineSecondaryCity,
} from './location-data.js';
import { LOCATION_LIST_KEYS, mergeLocationCountries } from './location-merge.js';
import { aliasesToRegex } from './normalization.js';
import { KZ_LOCATION_EXTENSIONS } from './kz-location-extensions.js';
import { UZ_LOCATION_EXTENSIONS } from './uz-location-extensions.js';
import { UA_MAJOR_LOCATION_EXTENSIONS } from './ua-location-extensions-major.js';
import { UA_REGIONAL_LOCATION_EXTENSIONS } from './ua-location-extensions-regional.js';
import { UA_SECONDARY_LOCATION_EXTENSIONS } from './ua-secondary-cities.js';
import { UA_METRO_LOCATION_EXTENSIONS } from './ua-location-extensions-metro.js';

export const UA_EXTRA_LOCATION_DICTIONARIES = Object.freeze({
  ...RAW_UA_EXTRA_LOCATION_DICTIONARIES,
  Zaporizhzhia: Object.freeze({
    ...RAW_UA_EXTRA_LOCATION_DICTIONARIES.Zaporizhzhia,
    districts: Object.freeze(
      (RAW_UA_EXTRA_LOCATION_DICTIONARIES.Zaporizhzhia?.districts || [])
        .filter(({ name }) => name !== 'Komunarskyi'),
    ),
  }),
});

const TASHKENT_UNSUPPORTED_SEED_MICRODISTRICTS = new Set([
  'Sergeli',
  'Sebzar',
  'Tashselmash',
  'Yangi Choshtepa',
  'Yunusabad-20',
  'Yunusabad-21',
  'Yunusabad-22',
]);

// The UZ seed is compatibility storage. In 0.3 semantic corrections are
// applied before merging it with the canonical Uzbekistan extension layer.
const UZ_BASE_LOCATION_DICTIONARIES = Object.freeze({
  ...(BASE_LOCATION_DICTIONARIES.UZ || {}),
  Tashkent: Object.freeze({
    ...(BASE_LOCATION_DICTIONARIES.UZ?.Tashkent || {}),
    microdistricts: Object.freeze(
      (BASE_LOCATION_DICTIONARIES.UZ?.Tashkent?.microdistricts || [])
        .filter(({ name }) => !TASHKENT_UNSUPPORTED_SEED_MICRODISTRICTS.has(name)),
    ),
    residentialComplexes: Object.freeze(
      (BASE_LOCATION_DICTIONARIES.UZ?.Tashkent?.residentialComplexes || [])
        .filter(({ name }) => name !== 'Tashkent City'),
    ),
  }),
});

function normalizeUzSemanticLocations(country) {
  const tashkent = country?.Tashkent;
  if (!tashkent) return country;
  const qorasuv = (tashkent.microdistricts || []).find(({ name }) => name === 'Qorasuv');
  if (!qorasuv) return country;

  // Bare Qorasuv is ambiguous with numbered Qorasuv/Karasu blocks. The
  // umbrella area therefore requires an area/massif/daha form in free text.
  const qorasuvAliases = Object.freeze([...new Set([
    ...(qorasuv.aliases || []).filter((alias) => !/^(?:qorasuv|korasuv|корасув|карасу)$/iu.test(String(alias).trim())),
    'Qorasuv dahasi',
    'Qorasuv daha',
    'Қорасув даҳаси',
    'Корасув дахаси',
    'Карасу даха',
  ])]);
  const qorasuvArea = Object.freeze({
    ...qorasuv,
    type: 'local_area',
    entityType: 'local_area',
    parent: 'Mirzo Ulugbek',
    aliases: qorasuvAliases,
    re: aliasesToRegex(qorasuvAliases),
  });

  return Object.freeze({
    ...country,
    Tashkent: Object.freeze({
      ...tashkent,
      microdistricts: Object.freeze((tashkent.microdistricts || []).filter(({ name }) => name !== 'Qorasuv')),
      localAreas: Object.freeze([
        ...(tashkent.localAreas || []),
        qorasuvArea,
      ]),
    }),
  });
}

const ODESA_FONTAN_STATION_RE = /^(?:[5-9]|1[0-6]) Fontan Station$/u;

function normalizeUaSemanticLocations(country) {
  const odesa = country?.Odesa;
  if (!odesa) return country;

  // “5–16 station of Velykyi Fontan” are traditional listing/locality zones
  // anchored to the Fontanska Road transit stops, not twelve standalone city
  // microdistricts. Keep their parsing value but expose them as local areas.
  const fontanStationAreas = Object.freeze(
    (odesa.microdistricts || [])
      .filter(({ name }) => ODESA_FONTAN_STATION_RE.test(name))
      .map((entry) => Object.freeze({
        ...entry,
        type: 'local_area',
        entityType: 'local_area',
      })),
  );

  return Object.freeze({
    ...country,
    Odesa: Object.freeze({
      ...odesa,
      microdistricts: Object.freeze(
        (odesa.microdistricts || []).filter(({ name }) => !ODESA_FONTAN_STATION_RE.test(name)),
      ),
      localAreas: Object.freeze([
        ...(odesa.localAreas || []),
        ...fontanStationAreas,
      ]),
    }),
  });
}

const UZ_LOCATION_DICTIONARIES = normalizeUzSemanticLocations(mergeLocationCountries(
  UZ_BASE_LOCATION_DICTIONARIES,
  UZ_LOCATION_EXTENSIONS,
));

const UA_SEMANTIC_LOCATION_EXTENSIONS = normalizeUaSemanticLocations(UA_MAJOR_LOCATION_EXTENSIONS);

const COUNTRY_LOCATION_DICTIONARIES = Object.freeze({
  ...BASE_LOCATION_DICTIONARIES,
  KZ: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.KZ || {},
    KZ_LOCATION_EXTENSIONS,
  ),
  UZ: UZ_LOCATION_DICTIONARIES,
  UA: mergeLocationCountries(
    UA_EXTRA_LOCATION_DICTIONARIES,
    UA_SEMANTIC_LOCATION_EXTENSIONS,
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
  const value = String(text || '');
  for (const [cityName, data] of cities) {
    for (const type of LOCATION_LIST_KEYS) {
      const match = (data[type] || []).find((entry) => entry?.re?.test(value));
      if (match) return { city: cityName, type, name: match.name, aliases: match.aliases };
    }
  }
  return null;
}
