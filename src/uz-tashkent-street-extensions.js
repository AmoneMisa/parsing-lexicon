const street = (name, aliases = []) => Object.freeze({
  canonical: name,
  name,
  type: 'street',
  entityType: 'street',
  country: 'UZ',
  city: 'Tashkent',
  aliases: Object.freeze([...new Set([name, ...aliases].filter(Boolean))]),
  confidence: 'verified',
});

/**
 * Verified multilingual aliases for major Tashkent streets.
 *
 * The stable English canonicals intentionally match the legacy location seed
 * and geo-catalog lookup keys. Local-language and OSM spelling variants stay
 * aliases so parser consumers do not get canonical-name churn.
 */
export const UZ_TASHKENT_STREET_EXTENSIONS = Object.freeze({
  Tashkent: Object.freeze({
    streets: Object.freeze([
      street('Amir Temur Avenue', [
        'Amir Timur Avenue',
        'Amir Temur shoh ko‘chasi',
        "Amir Temur shoh ko'chasi",
        'проспект Амира Темура',
        'проспект Амира Тимура',
        'Амира Тимура проспект',
        'Амир Темур шоҳ кўчаси',
      ]),
      street('Shota Rustaveli Street', [
        'Shota Rustaveli ko‘chasi',
        "Shota Rustaveli ko'chasi",
        'улица Шота Руставели',
        'Шота Руставели улица',
        'Шота Руставели кўчаси',
      ]),
      street('Nukus Street', [
        'Nukus ko‘chasi',
        "Nukus ko'chasi",
        'улица Нукус',
        'Нукусская улица',
        'Нукус кўчаси',
      ]),
      street('Buyuk Ipak Yoli Street', [
        'Buyuk Ipak Yuli Street',
        'Buyuk Ipak Yo‘li ko‘chasi',
        "Buyuk Ipak Yo'li ko'chasi",
        'улица Буюк Ипак Йули',
        'Буюк Ипак Йули улица',
        'Буюк Ипак Йўли кўчаси',
      ]),
      street('Afrosiyob Street', [
        'Afrasiyab Street',
        'Afrosiyob ko‘chasi',
        "Afrosiyob ko'chasi",
        'улица Афросиаб',
        'Афросиаб улица',
        'Афросиёб кўчаси',
      ]),
      street('Mirzo Ulugbek Avenue', [
        'Mirzo Ulug‘bek Avenue',
        "Mirzo Ulug'bek shoh ko'chasi",
        'Mirzo Ulug‘bek shoh ko‘chasi',
        'проспект Мирзо Улугбека',
        'Мирзо Улуғбек шоҳ кўчаси',
      ]),
      street('Bunyodkor Avenue', [
        'Bunyudkor Avenue',
        'Bunyodkor shoh ko‘chasi',
        "Bunyodkor shoh ko'chasi",
        'проспект Бунёдкор',
        'Бунёдкор проспект',
        'Бунёдкор шоҳ кўчаси',
      ]),
      street('Muqimiy Street', [
        'Muqimiy ko‘chasi',
        "Muqimiy ko'chasi",
        'улица Мукими',
        'Мукими улица',
        'Муқимий кўчаси',
      ]),
      street('Furqat Street', [
        'Furkat Street',
        'Furqat ko‘chasi',
        "Furqat ko'chasi",
        'улица Фурката',
        'улица Фуркат',
        'Фуркат улица',
        'Фурқат кўчаси',
      ]),
      street('Beruniy Avenue', [
        'Beruniy Street',
        'Beruniy shoh ko‘chasi',
        "Beruniy shoh ko'chasi",
        'проспект Беруни',
        'Беруни проспект',
        'Беруний шоҳ кўчаси',
      ]),
      street('Taras Shevchenko Street', [
        'Taras Shevchenko ko‘chasi',
        "Taras Shevchenko ko'chasi",
        'улица Тараса Шевченко',
        'Тараса Шевченко улица',
      ]),
      street('Islam Karimov Street', [
        'Islom Karimov ko‘chasi',
        "Islom Karimov ko'chasi",
        'улица Ислама Каримова',
        'Ислама Каримова улица',
        'Ислом Каримов кўчаси',
      ]),
    ]),
  }),
});
