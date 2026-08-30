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

function semanticEntry(entry, name, aliases, entityType) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    ...entry,
    canonical: name,
    name,
    type: entityType,
    entityType,
    aliases: all,
    re: aliasesToRegex(all),
  });
}

function normalizeUzSemanticLocations(country) {
  let normalized = country;
  const tashkent = normalized?.Tashkent;
  const qorasuv = (tashkent?.microdistricts || []).find(({ name }) => name === 'Qorasuv');

  if (tashkent && qorasuv) {
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

    normalized = Object.freeze({
      ...normalized,
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

  const samarkand = normalized?.Samarkand;
  if (samarkand) {
    const landmarks = samarkand.landmarks || [];
    const localAreas = samarkand.localAreas || [];
    const streets = samarkand.streets || [];

    // Legacy UZ seeds contain a few Samarkand listing labels as separate
    // canonicals or under the wrong semantic collection. Normalize them to the
    // single physical subjects already represented by geo-catalog.
    const centralPark = landmarks.find(({ name }) => name === 'Central Park');
    const alisherPark = landmarks.find(({ name }) => name === 'Alisher Navoiy Park');
    const canonicalPark = centralPark || alisherPark;
    const parkAliases = [
      ...(centralPark?.aliases || []),
      ...(alisherPark?.aliases || []),
      'Central Park',
      'Alisher Navoiy Park',
    ];
    const normalizedPark = canonicalPark
      ? semanticEntry(canonicalPark, 'Central Park', parkAliases, 'poi')
      : null;

    const siyobBazaar = landmarks.find(({ name }) => name === 'Siyob Bazaar');
    const siabBazaar = landmarks.find(({ name }) => name === 'Siab Bazaar');
    const canonicalBazaar = siyobBazaar || siabBazaar;
    const bazaarAliases = [
      ...(siyobBazaar?.aliases || []),
      ...(siabBazaar?.aliases || []),
      'Siyob Bazaar',
      'Siab Bazaar',
    ];
    const normalizedBazaar = canonicalBazaar
      ? semanticEntry(canonicalBazaar, 'Siyob Bazaar', bazaarAliases, 'poi')
      : null;

    const universityLocalArea = localAreas.find(({ name }) => name === 'University Boulevard');
    const universityLandmark = landmarks.find(({ name }) => name === 'University Boulevard');
    const universityStreet = streets.find(({ name }) => name === 'University Boulevard');
    const canonicalUniversity = universityStreet || universityLandmark || universityLocalArea;
    const universityAliases = [
      ...(universityStreet?.aliases || []),
      ...(universityLandmark?.aliases || []),
      ...(universityLocalArea?.aliases || []),
      'University Boulevard',
    ];
    const normalizedUniversity = canonicalUniversity
      ? semanticEntry(canonicalUniversity, 'University Boulevard', universityAliases, 'street')
      : null;

    normalized = Object.freeze({
      ...normalized,
      Samarkand: Object.freeze({
        ...samarkand,
        localAreas: Object.freeze(localAreas.filter(({ name }) => name !== 'University Boulevard')),
        streets: Object.freeze([
          ...streets.filter(({ name }) => name !== 'University Boulevard'),
          ...(normalizedUniversity ? [normalizedUniversity] : []),
        ]),
        landmarks: Object.freeze([
          ...landmarks.filter(({ name }) => ![
            'Central Park',
            'Alisher Navoiy Park',
            'Siyob Bazaar',
            'Siab Bazaar',
            'University Boulevard',
            'Samarkand City',
          ].includes(name)),
          ...(normalizedPark ? [normalizedPark] : []),
          ...(normalizedBazaar ? [normalizedBazaar] : []),
        ]),
      }),
    });
  }

  const angren = normalized?.Angren;
  if (angren) {
    const microdistricts = angren.microdistricts || [];
    const localAreas = angren.localAreas || [];
    const mahallas = angren.mahallas || [];
    const streets = angren.streets || [];
    const legacyMicrodistrictNames = new Set([
      '1 microdistrict',
      '2 microdistrict',
      '3 microdistrict',
      '4 microdistrict',
      '5 microdistrict',
    ]);

    const quarterRows = Object.freeze([
      ['2 quarter', ['2-daha','2 daha','2 dahasi','2-й квартал','2 квартал','2 microdistrict','2 микрорайон','2-mikrorayon','2 mikrorayon','2 мкр']],
      ['3 quarter', ['3-daha','3 daha','3 dahasi','3-й квартал','3 квартал','3 microdistrict','3 микрорайон','3-mikrorayon','3 mikrorayon','3 мкр']],
      ['5 quarter', ['5-daha','5 daha','5 dahasi','5-й квартал','5 квартал','5 microdistrict','5 микрорайон','5-mikrorayon','5 mikrorayon','5 мкр']],
      ['6 quarter', ['6-daha','6 daha','6 dahasi','6-й квартал','6 квартал']],
      ['7 quarter', ['7-daha','7 daha','7 dahasi','7-й квартал','7 квартал']],
      ['8 quarter', ['8-daha','8 daha','8 dahasi','8-й квартал','8 квартал']],
      ['9 quarter', ['9-daha','9 daha','9 dahasi','9-й квартал','9 квартал']],
      ['10 quarter', ['10-daha','10 daha','10 dahasi','10-й квартал','10 квартал']],
      ['11 quarter', ['11-daha','11 daha','11 dahasi','11-й квартал','11 квартал']],
      ['32 quarter', ['32-daha','32 daha','32 dahasi','32-й квартал','32 квартал']],
      ['2/2 quarter', ['2/2-daha','2/2 daha','2/2 dahasi','2/2 квартал']],
      ['2/5 quarter', ['2/5-daha','2/5 daha','2/5 dahasi','2/5 квартал']],
      ['3/2 quarter', ['3/2-daha','3/2 daha','3/2 dahasi','3/2 квартал']],
      ['3/3 quarter', ['3/3-daha','3/3 daha','3/3 dahasi','3/3 квартал']],
      ['4/5 quarter', ['4/5-daha','4/5 daha','4/5 dahasi','4/5 квартал']],
      ['4/6 quarter', ['4/6-daha','4/6 daha','4/6 dahasi','4/6 квартал']],
      ['5/1A quarter', ['5/1A-daha','5/1A daha','5/1A dahasi','5/1-A daha','5/1-A dahasi','5/1A квартал','5/1-A квартал']],
      ['5/1B quarter', ['5/1B-daha','5/1B daha','5/1B dahasi','5/1-B daha','5/1-B dahasi','5/1B квартал','5/1-B квартал']],
      ['5/3 quarter', ['5/3-daha','5/3 daha','5/3 dahasi','5/3 квартал']],
      ['5/4 quarter', ['5/4-daha','5/4 daha','5/4 dahasi','5/4 квартал']],
      ['5/5 quarter', ['5/5-daha','5/5 daha','5/5 dahasi','5/5 квартал']],
      ['6/4 quarter', ['6/4-daha','6/4 daha','6/4 dahasi','6/4 квартал']],
      ['18/19 quarter', ['18/19-daha','18/19 daha','18/19 dahasi','18/19 квартал']],
    ]);
    const verifiedQuarterNames = new Set(quarterRows.map(([name]) => name));
    const quarterEntries = quarterRows.map(([name, aliases]) => semanticEntry({}, name, aliases, 'microdistrict'));

    const geologLocalArea = localAreas.find(({ name }) => name === 'Geolog');
    const geologAliases = [
      ...(geologLocalArea?.aliases || []),
      'Geolog MFY',
      'Geolog mahallasi',
      "Geolog mahalla fuqarolar yig'ini",
      'Геолог МФЙ',
      'махалля Геолог',
    ];
    const geologMahalla = semanticEntry(geologLocalArea || {}, 'Geolog', geologAliases, 'mahalla');

    const verifiedStreetRows = Object.freeze([
      ['Amir Temur Street', ['Amir Temur ko‘chasi',"Amir Temur ko'chasi",'улица Амира Темура','ул. Амира Темура']],
      ['Bunyodkor Street', ['Bunyodkor ko‘chasi',"Bunyodkor ko'chasi",'Бунёдкор кўчаси','улица Бунёдкор','ул. Бунёдкор']],
      ['Ohangaron Street', ['Ohangaron ko‘chasi',"Ohangaron ko'chasi",'Оҳангарон кўчаси','улица Ахангаран','улица Охангарон']],
    ]);
    const verifiedStreetNames = new Set(verifiedStreetRows.map(([name]) => name));
    const verifiedStreets = verifiedStreetRows.map(([name, aliases]) => semanticEntry({}, name, aliases, 'street'));

    normalized = Object.freeze({
      ...normalized,
      Angren: Object.freeze({
        ...angren,
        mahallas: Object.freeze([
          ...mahallas.filter(({ name }) => name !== 'Geolog'),
          geologMahalla,
        ]),
        microdistricts: Object.freeze([
          ...microdistricts.filter(({ name }) => !legacyMicrodistrictNames.has(name) && !verifiedQuarterNames.has(name)),
          ...quarterEntries,
        ]),
        localAreas: Object.freeze(localAreas.filter(({ name }) => name !== 'Geolog')),
        streets: Object.freeze([
          ...streets.filter(({ name }) => !verifiedStreetNames.has(name)),
          ...verifiedStreets,
        ]),
      }),
    });
  }

  return normalized;
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
