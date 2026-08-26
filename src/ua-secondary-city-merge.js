import { mergeLocationCityDictionaries } from './location-merge.js';
import { UA_SECONDARY_LOCATION_EXTENSIONS } from './ua-secondary-cities.js';

export function withSecondaryUkraineLocations(base) {
  return mergeLocationCityDictionaries(base, UA_SECONDARY_LOCATION_EXTENSIONS);
}
