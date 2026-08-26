import { locationEntries } from './location-merge.js';
import { UA_SECONDARY_LOCATION_EXTENSIONS } from './ua-secondary-cities.js';

export const UA_METRO_LOCATION_EXTENSIONS = Object.freeze({
  ...UA_SECONDARY_LOCATION_EXTENSIONS,
  Kharkiv: Object.freeze({
    ...(UA_SECONDARY_LOCATION_EXTENSIONS.Kharkiv || {}),
    metro: locationEntries([
      ['Akademika Pavlova', 'Академіка Павлова', 'Академика Павлова', 'Ак. Павлова', 'Ак Павлова'],
    ]),
  }),
});
