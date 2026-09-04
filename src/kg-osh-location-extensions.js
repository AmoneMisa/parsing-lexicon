import { locationEntries } from './location-merge.js';

export const KG_OSH_LOCATION_EXTENSIONS = Object.freeze({
  Osh: Object.freeze({
    microdistricts: locationEntries([
      ['Anar', 'Анар', 'микрорайон Анар', 'мкр Анар', 'Анар микрорайон', 'Anar microdistrict'],
      ['Tuleyken', 'Тулейкен', 'Толойкон', 'Төлөйкөн', 'микрорайон Тулейкен', 'микрорайон Толойкон', 'мкр Тулейкен', 'Tuleyken microdistrict', 'Toloikon microdistrict'],
    ]),
    settlements: locationEntries([
      ['Кеңеш', 'Кенеш', 'Kenesh', 'Кеңеш айылы', 'село Кеңеш', 'село Кенеш'],
      ['Керме-Тоо', 'Керме Тоо', 'Kerme-Too', 'Kerme Too', 'Керме-Тоо айылы', 'село Керме-Тоо'],
      ['Озгур', 'Ozgur', 'Озгур айылы', 'село Озгур'],
      ['Орке', 'Orke', 'Орке айылы', 'село Орке'],
      ['Пятилетка', 'Pyatiletka', 'Пятилетка айылы', 'село Пятилетка'],
      ['Тээке', 'Teeke', 'Тээке айылы', 'село Тээке'],
      ['Учар', 'Uchar', 'Учар айылы', 'село Учар'],
    ]),
    residentialComplexes: locationEntries([
      ['Asman Residence 1', 'Asman Residence-1', 'ASMAN RESIDENCE 1', 'Асман Резиденс 1', 'Асман Резиденс-1', 'ЖК Asman Residence 1', 'ЖК Асман Резиденс 1', 'Asman Residence 1 турак жай комплекси'],
    ]),
  }),
});
