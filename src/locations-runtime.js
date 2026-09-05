import {
  LOCATION_DICTIONARIES as BASE_LOCATION_DICTIONARIES,
  UA_REGION_ENTRIES,
  UA_SECONDARY_CITIES,
  matchUkraineRegion,
  matchUkraineSecondaryCity,
} from './locations.js';
import { LOCATION_LIST_KEYS, mergeLocationCountries } from './location-merge.js';
import { canonicalCity } from './geography.js';
import { KG_LOCATION_EXTENSIONS } from './kg-location-extensions.js';
import { KG_BISHKEK_AREA_EXTENSIONS } from './kg-bishkek-area-extensions.js';
import { KG_BISHKEK_STREET_EXTENSIONS } from './kg-bishkek-street-extensions.js';
import { KG_BISHKEK_RESIDENTIAL_EXTENSIONS } from './kg-bishkek-residential-extensions.js';
import { KG_OSH_LOCATION_EXTENSIONS } from './kg-osh-location-extensions.js';
import { KG_KARAKOL_LOCATION_EXTENSIONS } from './kg-karakol-location-extensions.js';
import { KG_JALAL_ABAD_LOCATION_EXTENSIONS } from './kg-jalal-abad-location-extensions.js';
import { KZ_DISTRICT_EXTENSIONS } from './kz-district-extensions.js';
import { KZ_SCRAPED_ADDRESS_EXTENSIONS as KZ_ADDRESS_EXTENSIONS } from './kz-address-extensions.js';
import { KZ_PRIMARY_ADDRESS_EXTENSIONS } from './kz-primary-address-extensions.js';
import { KZ_ALMATY_STREET_EXTENSIONS } from './kz-almaty-street-extensions.js';
import { KZ_ALMATY_CLEANED_RESIDENTIAL_EXTENSIONS } from './kz-almaty-cleaned-residential-extensions.js';
import { KZ_ASTANA_CLEANED_RESIDENTIAL_EXTENSIONS } from './kz-astana-cleaned-residential-extensions.js';
import { KZ_SHYMKENT_CLEANED_ADDRESS_EXTENSIONS } from './kz-shymkent-cleaned-address-extensions.js';
import { KZ_SCRAPED_TAIL_ADDRESS_EXTENSIONS as KZ_REGIONAL_ADDRESS_EXTENSIONS } from './kz-regional-address-extensions.js';
import { KZ_SCRAPED_LOCATION_EXTENSIONS as KZ_RESIDENTIAL_EXTENSIONS } from './kz-residential-extensions.js';
import { KZ_SCRAPED_SECONDARY_LOCATION_EXTENSIONS as KZ_REGIONAL_RESIDENTIAL_EXTENSIONS } from './kz-regional-residential-extensions.js';
import { KZ_KOSTANAY_LOCATION_EXTENSIONS } from './kz-kostanay-location-extensions.js';
import { KZ_PAVLODAR_LOCATION_EXTENSIONS } from './kz-pavlodar-location-extensions.js';
import { KZ_MICRODISTRICT_EXTENSIONS } from './kz-microdistrict-extensions.js';
import { KZ_CITY_RESIDENTIAL_EXTENSIONS } from './kz-city-residential-extensions.js';
import { UA_RESIDENTIAL_EXTENSIONS } from './ua-residential-extensions.js';
import { UA_CHERNIHIV_RESIDENTIAL_EXTENSIONS } from './ua-chernihiv-residential-extensions.js';
import { UA_KHARKIV_MICRODISTRICT_EXTENSIONS } from './ua-kharkiv-microdistrict-extensions.js';
import { UA_KYIV_STREET_EXTENSIONS } from './ua-kyiv-street-extensions.js';
import { UA_KHARKIV_STREET_EXTENSIONS } from './ua-kharkiv-street-extensions.js';
import { UA_DNIPRO_STREET_EXTENSIONS } from './ua-dnipro-street-extensions.js';
import { UA_ZAPORIZHZHIA_STREET_EXTENSIONS } from './ua-zaporizhzhia-street-extensions.js';
import { UA_KRYVYI_RIH_STREET_EXTENSIONS } from './ua-kryvyi-rih-street-extensions.js';
import { UA_MYKOLAIV_STREET_EXTENSIONS } from './ua-mykolaiv-street-extensions.js';
import { UA_VINNYTSIA_STREET_EXTENSIONS } from './ua-vinnytsia-street-extensions.js';
import { UA_CHERNIHIV_STREET_EXTENSIONS } from './ua-chernihiv-street-extensions.js';
import { UZ_TASHKENT_CONTEXT_EXTENSIONS } from './uz-tashkent-context-extensions.js';
import { UZ_TASHKENT_REVIEWED_RESIDENTIAL_EXTENSIONS } from './uz-tashkent-reviewed-residential-extensions.js';
import { UZ_TASHKENT_REVIEWED_STREET_EXTENSIONS } from './uz-tashkent-reviewed-street-extensions.js';
import { UZ_SAMARKAND_CONTEXT_EXTENSIONS } from './uz-samarkand-context-extensions.js';
import { UZ_BUKHARA_LOCATION_EXTENSIONS } from './uz-bukhara-location-extensions.js';
import { UZ_NUKUS_STREET_EXTENSIONS } from './uz-nukus-street-extensions.js';
import { UZ_NAMANGAN_STREET_EXTENSIONS } from './uz-namangan-street-extensions.js';
import { UZ_FERGANA_STREET_EXTENSIONS } from './uz-fergana-street-extensions.js';
import { UZ_ANDIJAN_STREET_EXTENSIONS } from './uz-andijan-street-extensions.js';
import { UZ_QARSHI_STREET_EXTENSIONS } from './uz-qarshi-street-extensions.js';

export { UA_REGION_ENTRIES, UA_SECONDARY_CITIES, matchUkraineRegion, matchUkraineSecondaryCity };

// Sattepo is a mahalla in the canonical Samarkand layer. The legacy base seed
// also exposes the same physical place as the Sartepa microdistrict; remove
// that duplicate owner before runtime extensions are merged.
const UZ_RUNTIME_BASE_LOCATION_DICTIONARIES = Object.freeze({
  ...(BASE_LOCATION_DICTIONARIES.UZ || {}),
  Samarkand: Object.freeze({
    ...(BASE_LOCATION_DICTIONARIES.UZ?.Samarkand || {}),
    microdistricts: Object.freeze(
      (BASE_LOCATION_DICTIONARIES.UZ?.Samarkand?.microdistricts || [])
        .filter(({ name }) => name !== 'Sartepa'),
    ),
  }),
});

const KG_LEGACY_LOCATION_DICTIONARIES = mergeLocationCountries(
  BASE_LOCATION_DICTIONARIES.KG || {},
  KG_LOCATION_EXTENSIONS,
  KG_BISHKEK_AREA_EXTENSIONS,
  KG_BISHKEK_STREET_EXTENSIONS,
  KG_BISHKEK_RESIDENTIAL_EXTENSIONS,
  KG_OSH_LOCATION_EXTENSIONS,
  KG_KARAKOL_LOCATION_EXTENSIONS,
  KG_JALAL_ABAD_LOCATION_EXTENSIONS,
);
const {
  'Jalal-Abad': legacyJalalAbadLocations,
  ...KG_CANONICAL_LOCATION_DICTIONARIES
} = KG_LEGACY_LOCATION_DICTIONARIES;
const KG_RUNTIME_LOCATION_DICTIONARIES = Object.freeze({
  ...KG_CANONICAL_LOCATION_DICTIONARIES,
  Manas: KG_CANONICAL_LOCATION_DICTIONARIES.Manas || legacyJalalAbadLocations || Object.freeze({}),
});

export const LOCATION_DICTIONARIES = Object.freeze({
  ...BASE_LOCATION_DICTIONARIES,
  UA: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.UA || {},
    UA_RESIDENTIAL_EXTENSIONS,
    UA_CHERNIHIV_RESIDENTIAL_EXTENSIONS,
    UA_KHARKIV_MICRODISTRICT_EXTENSIONS,
    UA_KYIV_STREET_EXTENSIONS,
    UA_KHARKIV_STREET_EXTENSIONS,
    UA_DNIPRO_STREET_EXTENSIONS,
    UA_ZAPORIZHZHIA_STREET_EXTENSIONS,
    UA_KRYVYI_RIH_STREET_EXTENSIONS,
    UA_MYKOLAIV_STREET_EXTENSIONS,
    UA_VINNYTSIA_STREET_EXTENSIONS,
    UA_CHERNIHIV_STREET_EXTENSIONS,
  ),
  UZ: mergeLocationCountries(
    UZ_RUNTIME_BASE_LOCATION_DICTIONARIES,
    UZ_TASHKENT_CONTEXT_EXTENSIONS,
    UZ_TASHKENT_REVIEWED_RESIDENTIAL_EXTENSIONS,
    UZ_TASHKENT_REVIEWED_STREET_EXTENSIONS,
    UZ_SAMARKAND_CONTEXT_EXTENSIONS,
    UZ_BUKHARA_LOCATION_EXTENSIONS,
    UZ_NUKUS_STREET_EXTENSIONS,
    UZ_NAMANGAN_STREET_EXTENSIONS,
    UZ_FERGANA_STREET_EXTENSIONS,
    UZ_ANDIJAN_STREET_EXTENSIONS,
    UZ_QARSHI_STREET_EXTENSIONS,
  ),
  KZ: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.KZ || {},
    KZ_DISTRICT_EXTENSIONS,
    KZ_RESIDENTIAL_EXTENSIONS,
    KZ_REGIONAL_RESIDENTIAL_EXTENSIONS,
    KZ_ADDRESS_EXTENSIONS,
    KZ_PRIMARY_ADDRESS_EXTENSIONS,
    KZ_ALMATY_STREET_EXTENSIONS,
    KZ_ALMATY_CLEANED_RESIDENTIAL_EXTENSIONS,
    KZ_ASTANA_CLEANED_RESIDENTIAL_EXTENSIONS,
    KZ_SHYMKENT_CLEANED_ADDRESS_EXTENSIONS,
    KZ_REGIONAL_ADDRESS_EXTENSIONS,
    KZ_KOSTANAY_LOCATION_EXTENSIONS,
    KZ_PAVLODAR_LOCATION_EXTENSIONS,
    KZ_MICRODISTRICT_EXTENSIONS,
    KZ_CITY_RESIDENTIAL_EXTENSIONS,
  ),
  KG: KG_RUNTIME_LOCATION_DICTIONARIES,
});

function canonicalDictionaryCity(countryCode, city) {
  if (!city) return null;
  return canonicalCity(city, countryCode) || city;
}

export function dictionaryFor(countryCode, city) {
  const canonical = canonicalDictionaryCity(countryCode, city);
  return canonical ? LOCATION_DICTIONARIES[countryCode]?.[canonical] || null : null;
}

export function locationCities(countryCode) {
  return LOCATION_DICTIONARIES[countryCode] || Object.freeze({});
}

export function matchDictionaryLocation(text, countryCode, city = null) {
  const country = locationCities(countryCode);
  const canonical = canonicalDictionaryCity(countryCode, city);
  const cities = canonical && country[canonical] ? [[canonical, country[canonical]]] : Object.entries(country);
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
