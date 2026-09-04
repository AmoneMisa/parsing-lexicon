import { locationEntries } from './location-merge.js';

export const KZ_KOSTANAY_LOCATION_EXTENSIONS = Object.freeze({
  Kostanay: Object.freeze({
    microdistricts: locationEntries([
      ['3-й микрорайон', '3 микрорайон', '3 мкр', '3 мкр.', '3-й мкр'],
      ['5-й микрорайон', '5 микрорайон', '5 мкр', '5 мкр.', '5-й мкр'],
      ['9-й микрорайон', '9 микрорайон', '9 мкр', '9 мкр.', '9-й мкр'],
      ['Наурыз', 'Микрорайон Наурыз', 'микрорайон Наурыз', 'мкр Наурыз', 'Nauryz'],
      ['Береке', 'Микрорайон Береке', 'микрорайон Береке', 'мкр Береке', 'Bereke'],
    ]),
    residentialComplexes: locationEntries([
      ['Алтын Арман', 'Алтын-Арман', 'Altyn Arman', 'ЖК Алтын Арман', 'ЖК Алтын-Арман', 'жилой комплекс Алтын Арман'],
    ]),
  }),
});
