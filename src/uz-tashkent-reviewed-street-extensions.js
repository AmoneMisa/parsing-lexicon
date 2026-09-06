import { locationEntries } from './location-merge.js';

/**
 * Reviewed Tashkent street aliases from provider-backed geo/address evidence.
 * Keep aliases street-qualified so generic area/mahalla references are not captured.
 */
export const UZ_TASHKENT_REVIEWED_STREET_EXTENSIONS = Object.freeze({
  Tashkent: Object.freeze({
    streets: locationEntries([
      ['Тараккиёт 4-мавзе улица', 'Тараккиёт 4 мавзе улица'],
      ['Улица Ташкент', 'ул. Ташкент'],
      ['Shifokorlar Street',
        'Shifokorlar ko‘chasi',
        "Shifokorlar ko'chasi",
        'Шифокорлар кўчаси',
        'улица Шифокорлар',
        'ул. Шифокорлар',
        'Shifokorlar-5',
        'Shifokorlar 5',
        'Шифокорлар-5',
        'Шифокорлар 5',
        'Shifokorlar-6',
        'Shifokorlar 6',
        'Шифокорлар-6',
        'Шифокорлар 6',
        'улица Шифокорлар, 5',
        'ул. Шифокорлар, 5',
        'улица Шифокорлар, 6',
        'ул. Шифокорлар, 6',
      ],
      ['Shimoliy Olmazor Street', 'Shimoliy Olmazor ko‘chasi', "Shimoliy Olmazor ko'chasi", 'Шимолий Олмазор кўчаси', 'улица Шимолий Олмазор', 'ул. Шимолий Олмазор'],
    ]),
  }),
});
