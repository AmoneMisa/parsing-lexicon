import { aliasesToRegex } from './normalization.js';

function street(name, aliases = []) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical: name,
    name,
    type: 'street',
    entityType: 'street',
    country: 'KZ',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

/**
 * Street names promoted from the cleaned Almaty scrape that are not already
 * owned by the base KZ dictionary or KZ_PRIMARY_ADDRESS_EXTENSIONS.
 * Keep the geo-catalog label as canonical and add listing-friendly spelling,
 * abbreviation and Latin forms without inventing a second physical entity.
 */
export const KZ_ALMATY_STREET_EXTENSIONS = Object.freeze({
  Almaty: Object.freeze({
    streets: Object.freeze([
      street('15-я улица', ['15 улица', '15-я ул.', '15 ул.', '15th Street']),
      street('2-й переулок', ['2 переулок', '2-й пер.', '2 пер.', '2nd Lane']),
      street('5-ші тұйық көшесі', ['5-ші тұйық', '5 тұйық көшесі', '5 тұйық']),
      street('6-я улица', ['6 улица', '6-я ул.', '6 ул.', '6th Street']),
      street('Алданская улица', ['улица Алданская', 'ул. Алданская', 'Алданская', 'Aldanskaya Street']),
      street('Восточная улица', ['улица Восточная', 'ул. Восточная', 'Восточная', 'Vostochnaya Street']),
      street('Грушевая улица', ['улица Грушевая', 'ул. Грушевая', 'Грушевая', 'Grushevaya Street']),
      street('Жаркентская улица', ['улица Жаркентская', 'ул. Жаркентская', 'Жаркентская', 'Zharkentskaya Street']),
      street('Карьерная улица', ['улица Карьерная', 'ул. Карьерная', 'Карьерная', 'Kariernaya Street', 'Karyernaya Street']),
      street('Молодежная улица', ['Молодёжная улица', 'улица Молодежная', 'улица Молодёжная', 'ул. Молодежная', 'Молодежная', 'Молодёжная', 'Molodezhnaya Street']),
      street('Строительная улица', ['улица Строительная', 'ул. Строительная', 'Строительная', 'Stroitelnaya Street']),
      street('Улица Абдуллиных', ['улица Абдуллиных', 'ул. Абдуллиных', 'Абдуллиных', 'Abdullinykh Street', 'Abdullin Street']),
      street('Улица Артёма', ['улица Артёма', 'улица Артема', 'ул. Артёма', 'ул. Артема', 'Артёма', 'Артема', 'Artyom Street', 'Artema Street']),
      street('Улица Байсултанова', ['улица Байсултанова', 'ул. Байсултанова', 'Байсултанова', 'Байсұлтанов көшесі', 'Baisultanov Street', 'Baysultanov Street']),
      street('Улица Варламова', ['улица Варламова', 'ул. Варламова', 'Варламова', 'Varlamov Street']),
      street('Улица Жакибаева', ['улица Жакибаева', 'ул. Жакибаева', 'Жакибаева', 'Жақыбаев көшесі', 'Zhakibaev Street', 'Zhaqybaev Street']),
      street('Улица Каусар', ['улица Каусар', 'ул. Каусар', 'Каусар', 'Қаусар көшесі', 'Kausar Street', 'Qausar Street']),
      street('Улица Левитана', ['улица Левитана', 'ул. Левитана', 'Левитана', 'Levitan Street']),
      street('Улица Попова', ['улица Попова', 'ул. Попова', 'Попова', 'Popov Street']),
      street('Улица Руханият', ['улица Руханият', 'ул. Руханият', 'Руханият', 'Руханият көшесі', 'Rukhaniyat Street', 'Ruhaniyat Street']),
      street('Улица Теренозек', ['улица Теренозек', 'ул. Теренозек', 'Теренозек', 'Теренөзек көшесі', 'Terenozek Street', 'Terenözek Street']),
      street('Улица Шемякина', ['улица Шемякина', 'ул. Шемякина', 'Шемякина', 'Shemyakin Street', 'Shemyakina Street']),
      street('Улица Юрия Кима', ['улица Юрия Кима', 'ул. Юрия Кима', 'Юрия Кима', 'Юрий Ким көшесі', 'Yuri Kim Street', 'Yuriy Kim Street']),
    ]),
  }),
});
