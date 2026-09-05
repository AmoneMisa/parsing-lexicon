import { locationEntries } from './location-merge.js';

/**
 * Reviewed Tashkent 2GIS records whose provider subtype is explicitly `street`.
 * Keep aliases street-qualified so generic Tashkent city/metro references are not captured.
 */
export const UZ_TASHKENT_REVIEWED_STREET_EXTENSIONS = Object.freeze({
  Tashkent: Object.freeze({
    streets: locationEntries([
      ['Тараккиёт 4-мавзе улица', 'Тараккиёт 4 мавзе улица'],
      ['Улица Ташкент', 'ул. Ташкент'],
    ]),
  }),
});
