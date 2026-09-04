import { locationEntries } from './location-merge.js';

export const KG_OSH_LOCATION_EXTENSIONS = Object.freeze({
  Osh: Object.freeze({
    microdistricts: locationEntries([
      ['Anar', 'Анар', 'микрорайон Анар', 'мкр Анар', 'Анар микрорайон', 'Anar microdistrict'],
      ['Tuleyken', 'Тулейкен', 'Толойкон', 'Төлөйкөн', 'микрорайон Тулейкен', 'микрорайон Толойкон', 'мкр Тулейкен', 'Tuleyken microdistrict', 'Toloikon microdistrict'],
    ]),
  }),
});
