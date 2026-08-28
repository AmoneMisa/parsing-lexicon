import { TASHKENT_AREAS } from './geo.js';

const area = (name, aliases, type = 'local_area') => Object.freeze({
  canonical: name,
  name,
  type,
  country: 'UZ',
  city: 'Tashkent',
  aliases: Object.freeze(aliases),
});

/** Additions to the core Tashkent catalog; entries here do not duplicate geo.js rows. */
export const TASHKENT_AREA_ADDITIONS = Object.freeze({
  Almazar: Object.freeze([
    area('Shifokorlar-1', ['шифокорлар 1', 'shifokorlar 1']),
    area('Shifokorlar-2', ['шифокорлар 2', 'shifokorlar 2']),
    area('Beruni-3', ['беруни 3', 'beruniy 3', 'beruni 3']),
    area('Hislat', ['хислат', 'hislat', 'xislat']),
    ...[1, 2, 3, 4].map((n) => area(`Beshkurgan-${n}`, [`бешкурган ${n}`, `бешқўрғон ${n}`, `beshqo rg on ${n}`, `beshkurgan ${n}`])),
  ]),
  Bektemir: Object.freeze([
    area('Suvsoz-1', ['сувсоз 1', 'водник 1', 'suvsoz 1']),
    area('Suvsoz-2', ['сувсоз 2', 'водник 2', 'suvsoz 2']),
    area('Binokor', ['бинокор', 'binokor']),
    area('Binokor-2', ['бинокор 2', 'binokor 2']),
    area('Majnuntol', ['мажнунтол', 'majnuntol']),
    area('Olima Oshirova', ['олима оширова', 'olima oshirova']),
    area('Bektemir', ['бектемир массив', 'bektemir massivi'], 'microdistrict'),
  ]),
  Mirobod: Object.freeze([
    area('Farovon', ['фаровон', 'farovon']),
    area('Abdurauf Fitrat', ['абдурауф фитрат', 'abdurauf fitrat']),
  ]),
  'Mirzo Ulugbek': Object.freeze([
    area('Alayskiy C-2', ['алайский ц 2', 'алайский ц-2', 'alayskiy c 2', 'alayskiy c-2']),
    area('Feruza-1', ['феруза 1', 'feruza 1']),
    area('Buz-1', ['буз 1', 'бўз 1', 'boz 1', 'bo z 1']),
    area('Turon', ['турон', 'turon']),
    area('Riyoziy', ['риёзий', 'riyoziy']),
  ]),
  Sergeli: Object.freeze([
    area('Sergeli-2 G-40', ['сергели 2 г 40', 'sergeli 2 g 40'], 'microdistrict'),
    area('Babur Quarter', ['квартал бабур', 'бабур квартал', 'babur kvartal']),
  ]),
  Uchtepa: Object.freeze([
    area('Al-Khorezmi-2', ['аль хорезми 2', 'ал хорезми 2', 'al xorazmiy 2', 'al khorezmi 2']),
    area('Shark', ['массив шарк', 'шарк массив', 'sharq massivi'], 'microdistrict'),
  ]),
  Chilanzar: Object.freeze([
    area('Almazar Massif', ['массив алмазар', 'массив олмазор', 'almazar massivi', 'olmazor massivi'], 'microdistrict'),
  ]),
  Shaykhantahur: Object.freeze([
    area('Labzak C-13', ['лабзак ц 13', 'лабзак ц-13', 'labzak c 13', 'labzak c-13']),
    area('Gulabad', ['гульабад', 'гулабад', 'gulobod', 'gulabad', 'ц 26', 'c 26']),
    area('Aktepa', ['актепа шайхантахур', 'oqtepa shayxontohur']),
    area('Ibn Sino-1', ['ибн сино 1', 'ibn sino 1']),
    area('Ibn Sino-2', ['ибн сино 2', 'ibn sino 2']),
    area('Jarariq', ['джарарык', 'жарарик', 'jarariq', 'jararik']),
  ]),
  Yunusabad: Object.freeze([
    area('Kashgar C-4', ['кашгар ц 4', 'кашгар ц-4', 'kashgar c 4', 'kashgar c-4']),
    area('Katta Hasanboy', ['катта хасанбой', 'katta hasanboy']),
  ]),
  Yakkasaray: Object.freeze([
    area('Bobur', ['массив бобур', 'bobur massivi'], 'microdistrict'),
    area('Konstitutsiya', ['конституция массив', 'konstitutsiya massivi'], 'microdistrict'),
    area('Hamid Sulaymonov', ['хамид сулаймонов', 'hamid sulaymonov']),
  ]),
  Yashnobod: Object.freeze([
    area('Asalabad-1', ['асалабад 1', 'asalobod 1', 'asalabad 1']),
    area('Asalabad-2', ['асалабад 2', 'asalobod 2', 'asalabad 2']),
    area('Mumtoz', ['мумтаз', 'mumtoz']),
  ]),
});

export const FULL_TASHKENT_AREAS = Object.freeze(Object.fromEntries(
  [...new Set([...Object.keys(TASHKENT_AREAS), ...Object.keys(TASHKENT_AREA_ADDITIONS)])]
    .map((district) => [district, Object.freeze([
      ...(TASHKENT_AREAS[district] || []),
      ...(TASHKENT_AREA_ADDITIONS[district] || []),
    ])]),
));
