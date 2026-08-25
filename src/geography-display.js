// Centralized presentation names for canonical geography values.
// Consumers must not maintain their own city/district/metro display dictionaries.

export const GEOGRAPHY_DISPLAY_NAMES = Object.freeze({
  ru: Object.freeze({
    city: Object.freeze({
      Tashkent: 'Ташкент', Samarkand: 'Самарканд', Bukhara: 'Бухара', Namangan: 'Наманган',
      Andijan: 'Андижан', Fergana: 'Фергана', Nukus: 'Нукус', Navoi: 'Навои', Navoiy: 'Навои', Jizzakh: 'Джизак',
      Termez: 'Термез', Qarshi: 'Карши', Urgench: 'Ургенч', Gulistan: 'Гулистан', Chirchiq: 'Чирчик',
      'Tashkent Region': 'Ташкентская область', Karakalpakstan: 'Каракалпакстан', Kashkadarya: 'Кашкадарья',
      Surkhandarya: 'Сурхандарья', Syrdarya: 'Сырдарья', Khorezm: 'Хорезм',
      Almaty: 'Алматы', Astana: 'Астана', Shymkent: 'Шымкент', Karaganda: 'Караганда',
      Aktobe: 'Актобе', Atyrau: 'Атырау', Oral: 'Уральск', Taraz: 'Тараз', Pavlodar: 'Павлодар',
      Semey: 'Семей', Kostanay: 'Костанай', Kyzylorda: 'Кызылорда', Aktau: 'Актау', Oskemen: 'Усть-Каменогорск',
      Kyiv: 'Киев', Lviv: 'Львов', Odesa: 'Одесса', Kharkiv: 'Харьков', Dnipro: 'Днепр',
      Vinnytsia: 'Винница', 'Ivano-Frankivsk': 'Ивано-Франковск', Lutsk: 'Луцк', Chernivtsi: 'Черновцы',
      Zaporizhzhia: 'Запорожье', Poltava: 'Полтава', Rivne: 'Ровно', Ternopil: 'Тернополь',
      Uzhhorod: 'Ужгород', Khmelnytskyi: 'Хмельницкий', Zhytomyr: 'Житомир', Cherkasy: 'Черкассы',
      Chernihiv: 'Чернигов', Sumy: 'Сумы', Mykolaiv: 'Николаев', Kropyvnytskyi: 'Кропивницкий',
      Kherson: 'Херсон', 'Kryvyi Rih': 'Кривой Рог', Kremenchuk: 'Кременчуг', 'Bila Tserkva': 'Белая Церковь',
      Kamianske: 'Каменское', Vyshneve: 'Вишневое', Boryspil: 'Борисполь', Vyshhorod: 'Вышгород',
      Oleksandriia: 'Александрия', Pavlohrad: 'Павлоград', Nikopol: 'Никополь', Drohobych: 'Дрогобыч',
      Stryi: 'Стрый', Kolomyia: 'Коломыя', Kalush: 'Калуш', 'Kamianets-Podilskyi': 'Каменец-Подольский',
      Bucharest: 'Бухарест', 'Cluj-Napoca': 'Клуж-Напока', Timisoara: 'Тимишоара', Iasi: 'Яссы',
      Brasov: 'Брашов', Constanta: 'Констанца', Oradea: 'Орадя', Sibiu: 'Сибиу',
    }),
    district: Object.freeze({
      Chilanzar: 'Чиланзар', Yunusabad: 'Юнусабад', 'Mirzo Ulugbek': 'Мирзо-Улугбек',
      Yakkasaray: 'Яккасарай', Shaykhantahur: 'Шайхантахур', Yashnobod: 'Яшнабад', Sergeli: 'Сергели',
      Uchtepa: 'Учтепа', Mirobod: 'Мирабад', Bektemir: 'Бектемир', Olmazor: 'Алмазар',
      Almaly: 'Алмалинский', Bostandyk: 'Бостандыкский', Medeu: 'Медеуский', Auezov: 'Ауэзовский',
      Turksib: 'Турксибский', Nauryzbay: 'Наурызбайский', Alatau: 'Алатауский', Zhetysu: 'Жетысуский',
      Podil: 'Подол', Pechersk: 'Печерск', Pecherskyi: 'Печерский', Obolon: 'Оболонь',
      Shevchenkivskyi: 'Шевченковский', Solomianskyi: 'Соломенский', Darnytskyi: 'Дарницкий',
      Holosiivskyi: 'Голосеевский', Dniprovskyi: 'Днепровский', Sviatoshynskyi: 'Святошинский',
      Desnianskyi: 'Деснянский', Prymorskyi: 'Приморский', Frankivskyi: 'Франковский',
      Tsentralnyi: 'Центральный', 'Tsentralno-Miskyi': 'Центрально-Городской', Tsentr: 'Центр',
      Prospekt: 'Проспект', Ruska: 'Русская', Hraviton: 'Гравитон', Komarova: 'Комарова', Roscha: 'Роща',
      Sadgora: 'Садгора', Avtovokzal: 'Автовокзал', Pipera: 'Пипера', Militari: 'Милитари',
      'Drumul Taberei': 'Друмул Таберей', Titan: 'Титан', Berceni: 'Берчень', Floreasca: 'Флоряска',
      Dorobanti: 'Доробанць', Cotroceni: 'Котрочень',
    }),
    metro: Object.freeze({
      'Buyuk Ipak Yoli': 'Буюк Ипак Йули', Pushkin: 'Пушкин', 'Hamid Olimjon': 'Хамид Алимджан',
      'Amir Temur Xiyoboni': 'Амир Темур Хиёбони', 'Mustaqillik Maydoni': 'Мустакиллик майдони',
      Paxtakor: 'Пахтакор', 'Xalqlar Dostligi': 'Халклар Дустлиги', 'Milliy Bog': 'Миллий Бог', Novza: 'Новза',
      'Mirzo Ulugbek': 'Мирзо Улугбек', Chilonzor: 'Чиланзар', Olmazor: 'Алмазар', Choshtepa: 'Чаштепа',
      Ozgarish: 'Узгариш', Sergeli: 'Сергели', Yangihayot: 'Янгихаёт', Chinor: 'Чинар', Beruniy: 'Беруни',
      Tinchlik: 'Тинчлик', Chorsu: 'Чорсу', 'Gafur Gulom': 'Гафур Гулям', 'Alisher Navoi': 'Алишер Навои',
      Ozbekiston: 'Узбекистан', Kosmonavtlar: 'Космонавтлар', Oybek: 'Ойбек', Toshkent: 'Ташкент',
      Mashinasozlar: 'Машинасозлар', Dostlik: 'Дустлик', Turkiston: 'Туркистон', Yunusobod: 'Юнусабад',
      Shahriston: 'Шахристан', Bodomzor: 'Бадамзар', Minor: 'Минор', 'Abdulla Qodiriy': 'Абдулла Кадыри',
      'Yunus Rajabiy': 'Юнус Раджаби', 'Ming Orik': 'Мингурик', Texnopark: 'Технопарк', Yashnobod: 'Яшнабад',
      Tuzel: 'Тузель', Olmos: 'Алмас', Rohat: 'Рохат', Yangiobod: 'Янгиабад', Qoyliq: 'Куйлюк', Matonat: 'Матонат',
      Qiyot: 'Кият', Tolariq: 'Толарык', Xonobod: 'Хонабад', Quruvchilar: 'Курувчилар', Turon: 'Туран', Qipchoq: 'Кипчак',
    }),
    metroAlias: Object.freeze({
      'Buyuk Ipak Yoli': 'Максим Горький', Novza: 'Хамза',
      'Amir Temur Xiyoboni': 'Сквер Октябрьской Революции', 'Mustaqillik Maydoni': 'Площадь Ленина',
      'Milliy Bog': 'Национальный парк', Yunusobod: 'Фахрийлар чойхонаси',
      'Xalqlar Dostligi': 'Дружба народов', Ozbekiston: 'Узбекистан', Mashinasozlar: 'Машиностроителей',
      Dostlik: 'Дружба', Tinchlik: 'Мир',
    }),
  }),
});

function languageKey(locale) {
  return String(locale || 'en').toLowerCase().split(/[-_]/)[0];
}

export function geographyDisplayName(value, locale = 'en', kind = 'any') {
  const text = String(value || '').trim();
  if (!text) return '';
  const tables = GEOGRAPHY_DISPLAY_NAMES[languageKey(locale)];
  if (!tables) return text;
  if (kind === 'city') return tables.city[text] || text;
  if (kind === 'district') return tables.district[text] || text;
  if (kind === 'metro') return tables.metro[text] || text;
  return tables.city[text] || tables.district[text] || tables.metro[text] || text;
}

export function geographyMetroLabelWithAlias(value, locale = 'en') {
  const text = String(value || '').trim();
  if (!text) return '';
  const label = geographyDisplayName(text, locale, 'metro');
  const tables = GEOGRAPHY_DISPLAY_NAMES[languageKey(locale)];
  const alias = tables?.metroAlias?.[text];
  return alias && alias !== label ? `${label} (${alias})` : label;
}
