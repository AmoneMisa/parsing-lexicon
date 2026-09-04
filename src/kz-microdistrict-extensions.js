import { locationEntries } from './location-merge.js';

export const KZ_MICRODISTRICT_EXTENSIONS = Object.freeze({
  Aktobe: Object.freeze({
    microdistricts: locationEntries([
      ['1-й микрорайон', '1 микрорайон', '1 мкр', '1 мкр.', '1-й мкр'],
      ['3-й микрорайон', '3 микрорайон', '3 мкр', '3 мкр.', '3-й мкр'],
      ['8-й микрорайон', '8 микрорайон', '8 мкр', '8 мкр.', '8-й мкр'],
    ]),
  }),
  Karaganda: Object.freeze({
    microdistricts: locationEntries([
      ['16-й микрорайон', '16 микрорайон', '16 мкр', '16 мкр.', '16-й мкр'],
    ]),
  }),
  Shymkent: Object.freeze({
    microdistricts: locationEntries([
      ['8-й микрорайон', '8 микрорайон', '8 мкр', '8 мкр.', '8-й мкр'],
      ['15-й микрорайон', '15 микрорайон', '15 мкр', '15 мкр.', '15-й мкр'],
      ['Нурсат', 'Микрорайон Нурсат', 'микрорайон Нурсат', 'мкр Нурсат'],
    ]),
  }),
  Taraz: Object.freeze({
    microdistricts: locationEntries([
      ['Улы Дала', 'Ұлы Дала', 'Микрорайон Улы Дала', 'микрорайон Улы Дала', 'мкр Улы Дала', 'Uly Dala'],
    ]),
  }),
});
