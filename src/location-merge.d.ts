export {
  LOCATION_LIST_KEYS,
  locationEntries,
  locationEntry,
  mergeLocationCityDictionaries,
  mergeLocationCountries,
  mergeLocationEntries,
} from '../index.js';
import type { LocationCityDictionary } from '../index.js';
export function markMapDataEntries<T extends Readonly<Record<string, LocationCityDictionary>>>(country: T): T;
export function isMapDataEntry(entry: unknown): boolean;
