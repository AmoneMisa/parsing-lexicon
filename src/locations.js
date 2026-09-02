import {
  LOCATION_DICTIONARIES as BASE_LOCATION_DICTIONARIES,
  UA_EXTRA_LOCATION_DICTIONARIES as RAW_UA_EXTRA_LOCATION_DICTIONARIES,
  UA_REGION_ENTRIES,
  UA_SECONDARY_CITIES,
  matchUkraineRegion,
  matchUkraineSecondaryCity,
} from './location-data.js';
import { mergeLocationCountries } from './location-merge.js';
import { aliasesToRegex } from './normalization.js';
import { KZ_LOCATION_EXTENSIONS } from './kz-location-extensions.js';
import { UZ_LOCATION_EXTENSIONS } from './uz-location-extensions.js';
import { UA_MAJOR_LOCATION_EXTENSIONS } from './ua-location-extensions-major.js';
import { UA_REGIONAL_LOCATION_EXTENSIONS } from './ua-location-extensions-regional.js';
import { UA_SECONDARY_LOCATION_EXTENSIONS } from './ua-secondary-cities.js';
import { UA_METRO_LOCATION_EXTENSIONS } from './ua-location-extensions-metro.js';
import { UA_KHARKIV_LOCATION_TRANSLATIONS } from './ua-kharkiv-location-translations.js';
import { UA_CITY_LOCATION_EXPANSIONS } from './ua-city-location-expansions.js';

const UA_EXTRA_LOCATION_DICTIONARIES = Object.freeze({
  ...RAW_UA_EXTRA_LOCATION_DICTIONARIES,
  Zaporizhzhia: Object.freeze({
    ...RAW_UA_EXTRA_LOCATION_DICTIONARIES.Zaporizhzhia,
    districts: Object.freeze(
      (RAW_UA_EXTRA_LOCATION_DICTIONARIES.Zaporizhzhia?.districts || [])
        .filter(({ name }) => name !== 'Komunarskyi'),
    ),
  }),
});

const TASHKENT_UNSUPPORTED_SEED_MICRODISTRICTS = new Set([
  'Sergeli',
  'Sebzar',
  'Tashselmash',
  'Yangi Choshtepa',
  'Yunusabad-20',
  'Yunusabad-21',
  'Yunusabad-22',
]);

const TASHKENT_MAHALLA_ALIAS_ADDITIONS = Object.freeze({
  Humoyun: Object.freeze([
    'Khumoyun',
    'Humoyun MFY',
    'Ҳумоюн маҳалласи',
    'Хумоюн',
    'махалля Хумаюн',
  ]),
  "Bog'ko'cha": Object.freeze([
    "Bog'ko'cha mahallasi",
    "Bog'ko'cha MFY",
    'Боғкўча маҳалласи',
    'Богкуча махалла',
    'махалля Богкуча',
  ]),
  "Bog'bon": Object.freeze([
    "Bog'bon MFY",
    'Богбон махалла',
  ]),
  Shifokorlar: Object.freeze([
    'Shifokorlar MFY',
    'Шифокорлар маҳалласи',
    'Шифокорлар махалласи',
    'махалля Шифокорлар',
  ]),
  "Chamanbog'": Object.freeze([
    "Chamanbog' mahallasi",
    "Chamanbog' MFY",
    'Чаманбоғ маҳалласи',
    'Чаманбог махалла',
    'махалля Чаманбог',
  ]),
  Asalobod: Object.freeze([
    'Asalobod MFY',
    'Асалобод маҳалласи',
    'Асалобод махалла',
    'махалля Асалобод',
  ]),
});

const LEGACY_SAMARKAND_SILK_ROAD_RESIDENCE = (
  BASE_LOCATION_DICTIONARIES.UZ?.Samarkand?.residentialComplexes || []
).find(({ name }) => name === 'Silk Road Residence');

// The UZ seed is compatibility storage. In 0.3 semantic corrections are
// applied before merging it with the canonical Uzbekistan extension layer.
const UZ_BASE_LOCATION_DICTIONARIES = Object.freeze({
  ...(BASE_LOCATION_DICTIONARIES.UZ || {}),
  Tashkent: Object.freeze({
    ...(BASE_LOCATION_DICTIONARIES.UZ?.Tashkent || {}),
    microdistricts: Object.freeze(
      (BASE_LOCATION_DICTIONARIES.UZ?.Tashkent?.microdistricts || [])
        .filter(({ name }) => !TASHKENT_UNSUPPORTED_SEED_MICRODISTRICTS.has(name)),
    ),
    residentialComplexes: Object.freeze([
      ...(BASE_LOCATION_DICTIONARIES.UZ?.Tashkent?.residentialComplexes || [])
        .filter(({ name }) => name !== 'Tashkent City' && name !== 'Silk Road Residence'),
      ...(LEGACY_SAMARKAND_SILK_ROAD_RESIDENCE ? [LEGACY_SAMARKAND_SILK_ROAD_RESIDENCE] : []),
    ]),
  }),
  Samarkand: Object.freeze({
    ...(BASE_LOCATION_DICTIONARIES.UZ?.Samarkand || {}),
    residentialComplexes: Object.freeze(
      (BASE_LOCATION_DICTIONARIES.UZ?.Samarkand?.residentialComplexes || [])
        .filter(({ name }) => name !== 'Silk Road Residence'),
    ),
  }),
});

function semanticEntry(entry, name, aliases, entityType) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    ...entry,
    canonical: name,
    name,
    type: entityType,
    entityType,
    aliases: all,
    re: aliasesToRegex(all),
  });
}

function normalizeUzSemanticLocations(country) {
  let normalized = Object.freeze(Object.fromEntries(
    Object.entries(country || {}).map(([cityName, data]) => {
      const localAreas = data?.localAreas || [];
      if (!localAreas.some(({ name }) => name === 'University area')) return [cityName, data];

      return [cityName, Object.freeze({
        ...data,
        localAreas: Object.freeze(localAreas.map((entry) => (
          entry.name === 'University area'
            ? semanticEntry(entry, 'University area', [
              ...(entry.aliases || []),
              'Universitet hududi',
              'Universitet atrofi',
              'Университет ҳудуди',
              'Университет атрофи',
            ], 'local_area')
            : entry
        ))),
      })];
    }),
  ));

  const tashkent = normalized?.Tashkent;
  if (tashkent) {
    normalized = Object.freeze({
      ...normalized,
      Tashkent: Object.freeze({
        ...tashkent,
        mahallas: Object.freeze((tashkent.mahallas || []).map((entry) => {
          const additions = TASHKENT_MAHALLA_ALIAS_ADDITIONS[entry.name];
          return additions
            ? semanticEntry(entry, entry.name, [...(entry.aliases || []), ...additions], 'mahalla')
            : entry;
        })),
      }),
    });
  }

  const normalizedTashkent = normalized?.Tashkent;
  const qorasuv = (normalizedTashkent?.microdistricts || []).find(({ name }) => name === 'Qorasuv');

  if (normalizedTashkent && qorasuv) {
    // Bare Qorasuv is ambiguous with numbered Qorasuv/Karasu blocks. The
    // umbrella area therefore requires an area/massif/daha form in free text.
    const qorasuvAliases = Object.freeze([...new Set([
      ...(qorasuv.aliases || []).filter((alias) => !/^(?:qorasuv|korasuv|корасув|карасу)$/iu.test(String(alias).trim())),
      'Qorasuv dahasi',
      'Qorasuv daha',
      'Қорасув даҳаси',
      'Корасув дахаси',
      'Карасу даха',
    ])]);
    const qorasuvArea = Object.freeze({
      ...qorasuv,
      type: 'local_area',
      entityType: 'local_area',
      parent: 'Mirzo Ulugbek',
      aliases: qorasuvAliases,
      re: aliasesToRegex(qorasuvAliases),
    });

    normalized = Object.freeze({
      ...normalized,
      Tashkent: Object.freeze({
        ...normalizedTashkent,
        microdistricts: Object.freeze((normalizedTashkent.microdistricts || []).filter(({ name }) => name !== 'Qorasuv')),
        localAreas: Object.freeze([
          ...(normalizedTashkent.localAreas || []),
          qorasuvArea,
        ]),
      }),
    });
  }

  const samarkand = normalized?.Samarkand;
  if (samarkand) {
    const microdistricts = samarkand.microdistricts || [];
    const mahallas = samarkand.mahallas || [];
    const settlements = samarkand.settlements || [];
    const landmarks = samarkand.landmarks || [];
    const localAreas = samarkand.localAreas || [];
    const streets = samarkand.streets || [];

    // Legacy UZ seeds contain a few Samarkand listing labels as separate
    // canonicals or under the wrong semantic collection. Normalize them to the
    // single physical subjects already represented by geo-catalog.
    const centralPark = landmarks.find(({ name }) => name === 'Central Park');
    const alisherPark = landmarks.find(({ name }) => name === 'Alisher Navoiy Park');
    const canonicalPark = centralPark || alisherPark;
    const parkAliases = [
      ...(centralPark?.aliases || []),
      ...(alisherPark?.aliases || []),
      'Central Park',
      'Alisher Navoiy Park',
    ];
    const normalizedPark = canonicalPark
      ? semanticEntry(canonicalPark, 'Central Park', parkAliases, 'poi')
      : null;

    const siyobBazaar = landmarks.find(({ name }) => name === 'Siyob Bazaar');
    const siabBazaar = landmarks.find(({ name }) => name === 'Siab Bazaar');
    const canonicalBazaar = siyobBazaar || siabBazaar;
    const bazaarAliases = [
      ...(siyobBazaar?.aliases || []),
      ...(siabBazaar?.aliases || []),
      'Siyob Bazaar',
      'Siab Bazaar',
    ];
    const normalizedBazaar = canonicalBazaar
      ? semanticEntry(canonicalBazaar, 'Siyob Bazaar', bazaarAliases, 'poi')
      : null;

    const universityLocalArea = localAreas.find(({ name }) => name === 'University Boulevard');
    const universityLandmark = landmarks.find(({ name }) => name === 'University Boulevard');
    const universityStreet = streets.find(({ name }) => name === 'University Boulevard');
    const canonicalUniversity = universityStreet || universityLandmark || universityLocalArea;
    const universityAliases = [
      ...(universityStreet?.aliases || []),
      ...(universityLandmark?.aliases || []),
      ...(universityLocalArea?.aliases || []),
      'University Boulevard',
    ];
    const normalizedUniversity = canonicalUniversity
      ? semanticEntry(canonicalUniversity, 'University Boulevard', universityAliases, 'street')
      : null;

    const sogdianaMicrodistrict = microdistricts.find(({ name }) => name === 'Sogdiana');
    const sogdianaLocalArea = localAreas.find(({ name }) => name === 'Sugdiyona');
    const sogdianaMahalla = mahallas.find(({ name }) => name === 'Sogdiana');
    const normalizedSogdiana = semanticEntry(
      sogdianaMahalla || sogdianaLocalArea || sogdianaMicrodistrict || {},
      'Sogdiana',
      [
        ...(sogdianaMahalla?.aliases || []),
        ...(sogdianaLocalArea?.aliases || []),
        ...(sogdianaMicrodistrict?.aliases || []),
        'Sugdiyona',
        "Sug'diyona",
        'Sug‘diyona',
        "So'g'diyona",
        'So‘g‘diyona',
        'Согдиана',
        'Согдиёна',
        'Сўғдиёна',
      ],
      'mahalla',
    );

    const kimyogarlarMicrodistrict = microdistricts.find(({ name }) => name === 'Kimyogarlar');
    const kimyogarlarLocalArea = localAreas.find(({ name }) => name === 'Kimyogarlar');
    const kimyogarlarSettlement = settlements.find(({ name }) => name === 'Kimyogarlar');
    const normalizedKimyogarlar = semanticEntry(
      kimyogarlarSettlement || kimyogarlarLocalArea || kimyogarlarMicrodistrict || {},
      'Kimyogarlar',
      [
        ...(kimyogarlarSettlement?.aliases || []),
        ...(kimyogarlarLocalArea?.aliases || []),
        ...(kimyogarlarMicrodistrict?.aliases || []),
        'Кимёгарлар',
        'Химики',
        'Химгородок',
        'посёлок Химиков',
        'поселок Химиков',
      ],
      'settlement',
    );

    const chilquduqSource = mahallas.find(({ name }) => ['Chilquduq', 'Chilkuduq', 'Chilkuduk'].includes(name));
    const navrozSource = mahallas.find(({ name }) => name === "Navro'z");
    const shirinSource = mahallas.find(({ name }) => name === 'Shirin');
    const choponOtaSource = mahallas.find(({ name }) => name === "Cho'pon ota");
    const normalizedChilquduq = semanticEntry(
      { ...(chilquduqSource || {}), parent: 'Xishrov' },
      'Chilquduq',
      [
        ...(chilquduqSource?.aliases || []),
        'Chilkuduq',
        'Chilkuduk',
        'Chilquduq MFY',
        'Chilquduq mahallasi',
        'Чилқудуқ',
        'Чилкудук',
      ],
      'mahalla',
    );
    const normalizedNavroz = navrozSource
      ? semanticEntry({ ...navrozSource, parent: 'Xishrov' }, "Navro'z", navrozSource.aliases || [], 'mahalla')
      : null;
    const normalizedShirin = shirinSource
      ? semanticEntry({ ...shirinSource, parent: 'Farhod' }, 'Shirin', shirinSource.aliases || [], 'mahalla')
      : null;
    const normalizedChoponOta = choponOtaSource
      ? semanticEntry({ ...choponOtaSource, parent: 'Farhod' }, "Cho'pon ota", choponOtaSource.aliases || [], 'mahalla')
      : null;

    const existingXishrov = settlements.find(({ name }) => ['Xishrov', 'Xishrav', 'Khishrav'].includes(name));
    const normalizedXishrov = semanticEntry(
      existingXishrov || {},
      'Xishrov',
      [
        ...(existingXishrov?.aliases || []),
        'Xishrav',
        'Khishrav',
        'Хишрав',
        "So'lim shaharchasi",
        'So‘lim shaharchasi',
        'Solim shaharchasi',
        'Сўлим шаҳарчаси',
        'Сулим шахарчаси',
      ],
      'settlement',
    );
    const existingFarhod = settlements.find(({ name }) => ['Farhod', 'Farxod'].includes(name));
    const normalizedFarhod = semanticEntry(
      existingFarhod || {},
      'Farhod',
      [
        ...(existingFarhod?.aliases || []),
        'Farhod shaharchasi',
        'Farxod shaharchasi',
        'Фарход шаҳарчаси',
        'Фарход шахарчаси',
      ],
      'settlement',
    );

    const verifiedSamarkandStreetRows = Object.freeze([
      ['Siyob Street', ['Siyob ko‘chasi', "Siyob ko'chasi", 'Сиёб кўчаси', 'Сиабская улица']],
      ["Cho'pon-Ota Street", ["Cho'pon-Ota ko'chasi", 'Cho‘pon-Ota ko‘chasi', 'Чўпон Ота кўчаси', 'улица Чупон-Ота']],
      ['Academician Vohid Abdullayev Street', ['Akademik Vohid Abdullayev ko‘chasi', "Akademik Vohid Abdullayev ko'chasi", 'Vohid Abdullayev ko‘chasi', 'улица Академика Вохида Абдуллаева']],
    ]);
    const verifiedSamarkandStreetNames = new Set(verifiedSamarkandStreetRows.map(([name]) => name));
    const verifiedSamarkandStreets = verifiedSamarkandStreetRows.map(([name, aliases]) => semanticEntry({}, name, aliases, 'street'));

    normalized = Object.freeze({
      ...normalized,
      Samarkand: Object.freeze({
        ...samarkand,
        mahallas: Object.freeze([
          ...mahallas.filter(({ name }) => ![
            'Sogdiana',
            'Chilquduq',
            'Chilkuduq',
            'Chilkuduk',
            "Navro'z",
            'Shirin',
            "Cho'pon ota",
          ].includes(name)),
          normalizedSogdiana,
          normalizedChilquduq,
          ...(normalizedNavroz ? [normalizedNavroz] : []),
          ...(normalizedShirin ? [normalizedShirin] : []),
          ...(normalizedChoponOta ? [normalizedChoponOta] : []),
        ]),
        microdistricts: Object.freeze(
          microdistricts.filter(({ name }) => !['Sogdiana', 'Kimyogarlar'].includes(name)),
        ),
        localAreas: Object.freeze(
          localAreas.filter(({ name }) => !['University Boulevard', 'Sugdiyona', 'Kimyogarlar'].includes(name)),
        ),
        settlements: Object.freeze([
          ...settlements.filter(({ name }) => !['Kimyogarlar', 'Xishrov', 'Xishrav', 'Khishrav', 'Farhod', 'Farxod'].includes(name)),
          normalizedKimyogarlar,
          normalizedXishrov,
          normalizedFarhod,
        ]),
        streets: Object.freeze([
          ...streets.filter(({ name }) => name !== 'University Boulevard' && !verifiedSamarkandStreetNames.has(name)),
          ...(normalizedUniversity ? [normalizedUniversity] : []),
          ...verifiedSamarkandStreets,
        ]),
        landmarks: Object.freeze([
          ...landmarks.filter(({ name }) => ![
            'Central Park',
            'Alisher Navoiy Park',
            'Siyob Bazaar',
            'Siab Bazaar',
            'University Boulevard',
            'Samarkand City',
          ].includes(name)),
          ...(normalizedPark ? [normalizedPark] : []),
          ...(normalizedBazaar ? [normalizedBazaar] : []),
        ]),
      }),
    });
  }

  const khiva = normalized?.Khiva;
  if (khiva) {
    const localAreas = khiva.localAreas || [];
    const ichanKala = localAreas.find(({ name }) => name === 'Ichan Kala');
    const oldCity = localAreas.find(({ name }) => name === 'Old City');

    if (ichanKala && oldCity) {
      // UNESCO identifies Itchan Kala as the historic inner-city of Khiva.
      // Keep listing-friendly Old City forms as aliases of that one place.
      const normalizedIchanKala = semanticEntry(ichanKala, 'Ichan Kala', [
        ...(ichanKala.aliases || []),
        ...(oldCity.aliases || []),
        'Old City',
      ], 'local_area');

      normalized = Object.freeze({
        ...normalized,
        Khiva: Object.freeze({
          ...khiva,
          localAreas: Object.freeze([
            ...localAreas.filter(({ name }) => !['Ichan Kala', 'Old City'].includes(name)),
            normalizedIchanKala,
          ]),
        }),
      });
    }
  }

  const angren = normalized?.Angren;
  if (angren) {
    const microdistricts = angren.microdistricts || [];
    const localAreas = angren.localAreas || [];
    const mahallas = angren.mahallas || [];
    const streets = angren.streets || [];
    const legacyMicrodistrictNames = new Set([
      '1 microdistrict',
      '2 microdistrict',
      '3 microdistrict',
      '4 microdistrict',
      '5 microdistrict',
    ]);

    const quarterRows = Object.freeze([
      ['2 quarter', ['2-daha','2 daha','2 dahasi','2-й квартал','2 квартал','2 microdistrict','2 микрорайон','2-mikrorayon','2 mikrorayon','2 мкр']],
      ['3 quarter', ['3-daha','3 daha','3 dahasi','3-й квартал','3 квартал','3 microdistrict','3 микрорайон','3-mikrorayon','3 mikrorayon','3 мкр']],
      ['5 quarter', ['5-daha','5 daha','5 dahasi','5-й квартал','5 квартал','5 microdistrict','5 микрорайон','5-mikrorayon','5 mikrorayon','5 мкр']],
      ['6 quarter', ['6-daha','6 daha','6 dahasi','6-й квартал','6 квартал']],
      ['7 quarter', ['7-daha','7 daha','7 dahasi','7-й квартал','7 квартал']],
      ['8 quarter', ['8-daha','8 daha','8 dahasi','8-й квартал','8 квартал']],
      ['9 quarter', ['9-daha','9 daha','9 dahasi','9-й квартал','9 квартал']],
      ['10 quarter', ['10-daha','10 daha','10 dahasi','10-й квартал','10 квартал']],
      ['11 quarter', ['11-daha','11 daha','11 dahasi','11-й квартал','11 квартал']],
      ['32 quarter', ['32-daha','32 daha','32 dahasi','32-й квартал','32 квартал']],
      ['2/2 quarter', ['2/2-daha','2/2 daha','2/2 dahasi','2/2 квартал']],
      ['2/5 quarter', ['2/5-daha','2/5 daha','2/5 dahasi','2/5 квартал']],
      ['3/2 quarter', ['3/2-daha','3/2 daha','3/2 dahasi','3/2 квартал']],
      ['3/3 quarter', ['3/3-daha','3/3 daha','3/3 dahasi','3/3 квартал']],
      ['4/5 quarter', ['4/5-daha','4/5 daha','4/5 dahasi','4/5 квартал']],
      ['4/6 quarter', ['4/6-daha','4/6 daha','4/6 dahasi','4/6 квартал']],
      ['5/1A quarter', ['5/1A-daha','5/1A daha','5/1A dahasi','5/1-A daha','5/1-A dahasi','5/1A квартал','5/1-A квартал']],
      ['5/1B quarter', ['5/1B-daha','5/1B daha','5/1B dahasi','5/1-B daha','5/1-B dahasi','5/1B квартал','5/1-B квартал']],
      ['5/3 quarter', ['5/3-daha','5/3 daha','5/3 dahasi','5/3 квартал']],
      ['5/4 quarter', ['5/4-daha','5/4 daha','5/4 dahasi','5/4 квартал']],
      ['5/5 quarter', ['5/5-daha','5/5 daha','5/5 dahasi','5/5 квартал']],
      ['6/4 quarter', ['6/4-daha','6/4 daha','6/4 dahasi','6/4 квартал']],
      ['18/19 quarter', ['18/19-daha','18/19 daha','18/19 dahasi','18/19 квартал']],
    ]);
    const verifiedQuarterNames = new Set(quarterRows.map(([name]) => name));
    const quarterEntries = quarterRows.map(([name, aliases]) => semanticEntry({}, name, aliases, 'microdistrict'));

    const geologLocalArea = localAreas.find(({ name }) => name === 'Geolog');
    const geologAliases = [
      ...(geologLocalArea?.aliases || []),
      'Geolog MFY',
      'Geolog mahallasi',
      "Geolog mahalla fuqarolar yig'ini",
      'Геолог МФЙ',
      'махалля Геолог',
    ];
    const geologMahalla = semanticEntry(geologLocalArea || {}, 'Geolog', geologAliases, 'mahalla');

    const verifiedStreetRows = Object.freeze([
      ['Amir Temur Street', ['Amir Temur ko‘chasi',"Amir Temur ko'chasi",'улица Амира Темура','ул. Амира Темура']],
      ['Bunyodkor Street', ['Bunyodkor ko‘chasi',"Bunyodkor ko'chasi",'Бунёдкор кўчаси','улица Бунёдкор','ул. Бунёдкор']],
      ['Ohangaron Street', ['Ohangaron ko‘chasi',"Ohangaron ko'chasi",'Оҳангарон кўчаси','улица Ахангаран','улица Охангарон']],
    ]);
    const verifiedStreetNames = new Set(verifiedStreetRows.map(([name]) => name));
    const verifiedStreets = verifiedStreetRows.map(([name, aliases]) => semanticEntry({}, name, aliases, 'street'));

    normalized = Object.freeze({
      ...normalized,
      Angren: Object.freeze({
        ...angren,
        mahallas: Object.freeze([
          ...mahallas.filter(({ name }) => name !== 'Geolog'),
          geologMahalla,
        ]),
        microdistricts: Object.freeze([
          ...microdistricts.filter(({ name }) => !legacyMicrodistrictNames.has(name) && !verifiedQuarterNames.has(name)),
          ...quarterEntries,
        ]),
        localAreas: Object.freeze(localAreas.filter(({ name }) => name !== 'Geolog')),
        streets: Object.freeze([
          ...streets.filter(({ name }) => !verifiedStreetNames.has(name)),
          ...verifiedStreets,
        ]),
      }),
    });
  }

  return normalized;
}

const ODESA_FONTAN_STATION_RE = /^(?:[5-9]|1[0-6]) Fontan Station$/u;

function normalizeUaSemanticLocations(country) {
  const odesa = country?.Odesa;
  if (!odesa) return country;

  // “5–16 station of Velykyi Fontan” are traditional listing/locality zones
  // anchored to the Fontanska Road transit stops, not twelve standalone city
  // microdistricts. Keep their parsing value but expose them as local areas.
  const fontanStationAreas = Object.freeze(
    (odesa.microdistricts || [])
      .filter(({ name }) => ODESA_FONTAN_STATION_RE.test(name))
      .map((entry) => Object.freeze({
        ...entry,
        type: 'local_area',
        entityType: 'local_area',
      })),
  );

  return Object.freeze({
    ...country,
    Odesa: Object.freeze({
      ...odesa,
      microdistricts: Object.freeze(
        (odesa.microdistricts || []).filter(({ name }) => !ODESA_FONTAN_STATION_RE.test(name)),
      ),
      localAreas: Object.freeze([
        ...(odesa.localAreas || []),
        ...fontanStationAreas,
      ]),
    }),
  });
}

const UZ_LOCATION_DICTIONARIES = normalizeUzSemanticLocations(mergeLocationCountries(
  UZ_BASE_LOCATION_DICTIONARIES,
  UZ_LOCATION_EXTENSIONS,
));

const UA_SEMANTIC_LOCATION_EXTENSIONS = normalizeUaSemanticLocations(UA_MAJOR_LOCATION_EXTENSIONS);
const UA_KHARKIV_TRANSLATION_EXTENSIONS = Object.freeze({
  Kharkiv: UA_KHARKIV_LOCATION_TRANSLATIONS,
});

const COUNTRY_LOCATION_DICTIONARIES = Object.freeze({
  ...BASE_LOCATION_DICTIONARIES,
  KZ: mergeLocationCountries(
    BASE_LOCATION_DICTIONARIES.KZ || {},
    KZ_LOCATION_EXTENSIONS,
  ),
  UZ: UZ_LOCATION_DICTIONARIES,
  UA: mergeLocationCountries(
    UA_EXTRA_LOCATION_DICTIONARIES,
    UA_SEMANTIC_LOCATION_EXTENSIONS,
    UA_REGIONAL_LOCATION_EXTENSIONS,
    UA_SECONDARY_LOCATION_EXTENSIONS,
    UA_METRO_LOCATION_EXTENSIONS,
    UA_KHARKIV_TRANSLATION_EXTENSIONS,
    UA_CITY_LOCATION_EXPANSIONS,
  ),
});

/** Canonical country -> city -> location dictionary registry. */
export const LOCATION_DICTIONARIES = COUNTRY_LOCATION_DICTIONARIES;

export {
  UA_REGION_ENTRIES,
  UA_SECONDARY_CITIES,
  matchUkraineRegion,
  matchUkraineSecondaryCity,
};