import { locationEntries } from './location-merge.js';

export const KG_KARAKOL_LOCATION_EXTENSIONS = Object.freeze({
  Karakol: Object.freeze({
    microdistricts: locationEntries([
      ['Voshod', 'Восход', 'микрорайон Восход', 'мкр Восход', 'Восход микрорайон', 'Voshod microdistrict'],
    ]),
    streets: locationEntries([
      ['Улица Алдашева', 'Алдашева', 'ул. Алдашева', 'Aldasheva Street'],
      ['Улица Гебзе', 'Гебзе', 'ул. Гебзе', 'Gebze Street'],
      ['Улица Карасаева', 'Карасаева', 'ул. Карасаева', 'Karasaeva Street'],
      ['Улица Ленина', 'Ленина', 'ул. Ленина', 'Lenina Street'],
      ['Улица Пржевальского', 'Пржевальского', 'ул. Пржевальского', 'Przhevalskogo Street'],
      ['Улица Шопокова', 'Шопокова', 'ул. Шопокова', 'Shopokova Street'],
      ['Улица Токтогула', 'Токтогула', 'ул. Токтогула', 'Toktogula Street'],
      ['Улица Тыныстанова', 'Тыныстанова', 'ул. Тыныстанова', 'Tynystanova Street'],
      ['Улица Жамансариева', 'Жамансариева', 'ул. Жамансариева', 'Zhamansarieva Street'],
    ]),
  }),
});
