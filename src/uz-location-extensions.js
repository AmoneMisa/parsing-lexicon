import { aliasesToRegex } from './normalization.js';

function entry(name, aliases = [], meta = {}) {
  const all = [...new Set([name, ...aliases].filter(Boolean))];
  return Object.freeze({ ...meta, name, aliases: Object.freeze(all), re: aliasesToRegex(all) });
}

function entries(rows = [], defaults = {}) {
  return Object.freeze(rows.map((row) => {
    if (Array.isArray(row)) return entry(row[0], row.slice(1), defaults);
    const { name, aliases = [], ...meta } = row;
    return entry(name, aliases, { ...defaults, ...meta });
  }));
}

function city({ districts = [], mahallas = [], microdistricts = [], localAreas = [], residentialComplexes = [], landmarks = [], suburbs = [] }) {
  return Object.freeze({
    ...(districts.length ? { districts: entries(districts, { entityType: 'district', country: 'UZ' }) } : {}),
    ...(mahallas.length ? { mahallas: entries(mahallas, { entityType: 'mahalla', country: 'UZ' }) } : {}),
    ...(microdistricts.length ? { microdistricts: entries(microdistricts, { entityType: 'microdistrict', country: 'UZ' }) } : {}),
    ...(localAreas.length ? { localAreas: entries(localAreas, { entityType: 'local_area', country: 'UZ' }) } : {}),
    ...(residentialComplexes.length ? { residentialComplexes: entries(residentialComplexes, { entityType: 'residential_complex', country: 'UZ' }) } : {}),
    ...(landmarks.length ? { landmarks: entries(landmarks, { entityType: 'poi', country: 'UZ' }) } : {}),
    ...(suburbs.length ? { suburbs: entries(suburbs, { entityType: 'suburb', country: 'UZ' }) } : {}),
  });
}

const numberedMicrodistricts = (numbers) => numbers.map((n) => [`${n} microdistrict`, `${n} микрорайон`, `${n}-mikrorayon`, `${n} mikrorayon`, `${n} мкр`]);

const NUKUS_MFY_NAMES = Object.freeze([
  'Bes tobe','Jipek jolı','Juwazshı','Nurli bostan','Qarataw','Janabazar','Bereket','Qizil qum','Jayxun','Gúzar','Jeke terek','Isbilermenler aymagi','Nawbahar','Darbent','Nawkan baǵ','Temir jol','Nawriz','Abat makan',"Jasil bag'","Shig'is",'Uzin kol','Amanliq guzari','Allaniyaz Qaxraman','Shimbay guzari','Ata makan','Jolshilar','Qutli qonis','Dosliq guzari','Hawa joli',"Botanika bag'i",'Taslaq','Qum awil','Qutli makan','Aydin jol','Shimbay shayxana','Sarbinaz','Eliabat','Shayirlar awili','Nur','Tungish qonis','Qurilisshi','Almazar','Garezsizlik','Gulzar','Ornek','Jana zaman','Qos kol','Aq otaw','Baqshiliq','Vatanparvar','Dosliq','Tinishliq','Xaliqlar dosligi','Anasay','Boz awil','Jas awlad','Qos bulaq','Jiydeli baysin','Aq jagis','Kok ozek','Amudarya','Tele oray','Shadli awil','Kattagar','Samanbay','Altin jagis','Gone qala','Turan','Qumbiz awil','Nawpir','Bayterek',
]);

const NUKUS_MFY_ALIASES = Object.freeze({
  'Jipek jolı': ['Jipek joli','Jipek Joli','Жипек жолы','Жипек жол','Шёлковый путь'],
  'Qizil qum': ['Qizilqum','Qizil Qum','Кызылкум','Қызылқум','Кизилкум'],
  Jayxun: ['Jayhun','Jeyhun','Джейхун','Жайхун'],
  Nawbahar: ['Navbahor','Navbahar','Навбахор','Навбахар'],
  Nawriz: ["Navro'z",'Navruz','Навруз','Наўрыз'],
  'Temir jol': ["Temir yo'l",'Темир жол','Темир йўл','Железнодорожный'],
  Dosliq: ["Do'stlik",'Dustlik','Дослык','Дустлик','Дўстлик'],
  "Shig'is": ['Shygys','Sharq','Шығыс','Шарк','Восток','Восточный'],
  "Jasil bag'": ['Jasıl baǵ',"Yashil bog'",'Яшил бог','Зелёный сад'],
  Garezsizlik: ['Gárezsizlik','Mustaqillik','Ғәрезсизлик','Независимость'],
  'Xaliqlar dosligi': ["Xalqlar do'stligi",'Халклар дустлиги','Халықлар дослығы','Дружба народов'],
  "Botanika bag'i": ["Botanika bog'i",'Ботаника багы','Ботанический сад'],
  Samanbay: ['Samanboy','Саманбай','Саманбой'],
  Bayterek: ['Baiterek','Байтирек','Байтерек','Бәйтерек'],
});

const nukusMahallas = NUKUS_MFY_NAMES.map((name) => ({
  name,
  aliases: [name, ...(NUKUS_MFY_ALIASES[name] || []), `${name} MFY`, `${name} mahallasi`],
  language: 'kaa_lat',
  confidence: 'official',
}));

export const UZ_LOCATION_EXTENSIONS = Object.freeze({
  Samarkand: city({
    mahallas: [
      { name: "Navro'z", aliases: ['Navroz','Navruz','Навруз','Наврўз'], confidence: 'official' },
      { name: 'Sattepo', aliases: ['Sattepa','Саттепо','Саттепа'], confidence: 'official' },
      { name: 'Shirin', aliases: ['Ширин'], confidence: 'official' },
      { name: 'Chilkuduk', aliases: ['Chilkuduq','Чилкудук','Чилқудуқ'], confidence: 'official' },
      { name: "Cho'pon ota", aliases: ['Chopon ota','Чупон Ота','Чопон Ота','Чўпон ота'], confidence: 'official' },
    ],
    localAreas: [
      ['Siyob','Сиаб','Сиёб','Сиабский','Сиабский район'],['Registon','Регистан','Registan'],['Center','Центр','Марказ','Markaz'],['University area','Университетский','Университет','Университет хиёбони'],
      ['University Boulevard','Бульвар','Бульвар Университетский'],['Dahbed','Дагбитская','Дагбит','Дахбед'],['Sattepo','Саттепо','Саттепа'],['Motrid','Мотрид'],['Kimyogarlar','Кимёгарлар','Химгородок','Химики'],
      ['Railway Station area','Вокзал','Темир йўл вокзали','Железнодорожный вокзал'],['Rudakiy','Рудакий','Рудаки'],['Gagarin area','Гагарина','Гагарин'],['Mirzo Ulugbek area','Мирзо Улугбек',"Mirzo Ulug'bek"],
      ['Spitamen','Спитамен','Спитаменшох'],['Panjakent Road','Панжикентская','Пенджикентская','Panjakent'],['Bogishamol','Багишамал','Боғишамол',"Bog'ishamol"],['Qorasuv','Карасу','Корасув'],
      ['Geofizika','Геофизика'],['Sugdiyona','Согдиана','Согдиёна',"Sug'diyona"],['Super Market area','Супер','Супер рынок'],['Dinamo area','Динамо','Динамо стадион'],['Afrosiyob','Афросиаб','Афросиёб'],
      ["So'zangaron",'Сузангаран','Сузангарон'],['Buyuk Ipak Yoli','Великий Шёлковый путь',"Buyuk Ipak yo'li"],
    ],
    landmarks: [
      ['Registan Square','Регистан','Registon','Площадь Регистан'],['Gur-e Amir','Гур-Эмир',"Go'ri Amir",'Гўри Амир'],['Shohi Zinda','Шахи-Зинда','Шоҳи Зинда'],['Bibi-Khanym','Биби-Ханым','Bibixonim','Бибихоним'],
      ['Siyob Bazaar','Сиабский базар','Siyob bozori','Сиёб бозори'],['Afrosiyob','Афросиаб','Афросиёб'],['Ulugbek Observatory','Обсерватория Улугбека',"Ulug'bek rasadxonasi"],['University Boulevard','Университетский бульвар','Universitet xiyoboni'],
      ['Eternal City','Вечный город','Boqiy shahar'],['Silk Road Samarkand'],['Samarkand City','Самарканд Сити'],['Samarkand International Airport','Международный аэропорт Самарканд','Samarqand xalqaro aeroporti','SKD'],
      ['Samarkand Railway Station','Самарканд вокзал','Samarqand vokzali'],['Central Park','Центральный парк',"Markaziy bog'"],['Alisher Navoiy Park','Парк Алишера Навои',"Alisher Navoiy bog'i"],['Youth Park','Парк Молодёжи',"Yoshlar bog'i"],
      ['Yangi Ozbekiston Park',"Yangi O'zbekiston bog'i",'Парк Новый Узбекистан'],['Family Park'],
    ],
  }),

  Namangan: city({
    districts: [['Davlatobod','Davlatobod tumani','Давлатабадский район','Давлатобод','Давлатобод тумани','Davlatabad'],['Yangi Namangan','Yangi Namangan tumani','Янги Наманган','Янги Наманган тумани','Новый Наманган','Yangi Namangan shaharchasi']],
    mahallas: [
      { name: 'Obihayot', aliases: ['Обихаёт'], confidence: 'official' },
      { name: 'Porloq', aliases: ['Порлок'], parent: 'Davlatobod', confidence: 'official' },
      { name: 'Mustaqillikning 5 yilligi', aliases: ['Мустакилликнинг 5 йиллиги'], parent: 'Yangi Namangan', confidence: 'official' },
    ],
    microdistricts: numberedMicrodistricts([1,2,3,4,5,6]),
    localAreas: [['Center','Центр','Markaz'],['North','Северный','Shimoliy'],['Chortoq area','Чартакский','Chortoq'],['Uychi area','Уйчи','Uychi'],['Turaqorgon area','Туракурган',"To'raqo'rg'on"],['Galaba',"G'alaba",'Галаба','Ғалаба'],['Bobur','Бобур','Bobur'],['Navoiy','Навои','Navoiy'],['Islom Karimov','Ислам Каримов'],['Qoqimboyshox','Кукумбой','Қўқимбойшох'],['Afrosiyob','Афросиаб'],['Boburshox','Бобуршох'],['Ibrat','Ибрат'],['Nodira','Нодира']],
    landmarks: [['Bobur Park',"Bobur bog'i",'Парк Бабура'],['Namangan International Airport','Namangan xalqaro aeroporti','Международный аэропорт Наманган','NMA'],['Namangan Railway Station','Namangan vokzali','Наманган вокзал'],['Namangan Chorsu','Chorsu bozori','Чорсу'],['Valley of Legends','Afsonalar vodiysi','Долина легенд'],['Yangi Ozbekiston Park',"Yangi O'zbekiston bog'i",'Новый Узбекистан']],
  }),

  Andijan: city({
    mahallas: [
      { name: "Bo'ston", aliases: ['Bostan','Buston','Бустон','Бўстон','Бостан'], confidence: 'official' },
      { name: 'Obod', aliases: ['Обод'], confidence: 'official' },
      { name: 'Temur Malik', aliases: ['Timur Malik','Темур Малик','Тимур Малик'], confidence: 'official' },
      { name: "Qoraqo'rg'on", aliases: ['Qorakurgan','Каракурган','Коракургон','Қорақўрғон'], confidence: 'official' },
      { name: "Ma'rifat", aliases: ['Marifat','Маърифат','Марифат'], confidence: 'official' },
      { name: 'Mustaqillikning 21 yilligi', aliases: ['Мустакилликнинг 21 йиллиги'], confidence: 'official' },
      { name: 'Birlashgan', aliases: ['Бирлашган','Объединённый'], confidence: 'official' },
      { name: "Taxtako'prik", aliases: ['Taxtakoprik','Тахтакуприк','Тахтакўприк'], confidence: 'official' },
    ],
    localAreas: [['Center','Центр','Markaz'],['Old City','Eski shahar','Эски шахар','Старый город'],['New City','Yangi shahar','Янги шахар','Новый город'],['Bobur','Бобур'],['Navoiy','Навои'],['Mashinasozlar','Машинасозлар'],['North','Северный микрорайон','Shimoliy'],['South-West','Юго-западный',"Janubi-g'arbiy"],['University area','Университетский'],['Railway Station area','Вокзал'],['Airport area','Аэропорт']],
    landmarks: [['Central Farmers Market','Markaziy dehqon bozori','Центральный рынок','Марказий бозор'],['Yangi Bozor','Yangi bozor','Янги бозор','Новый рынок'],['Bobur Square','Bobur maydoni','площадь Бабура'],['Bobur Park',"Bobur bog'i",'Парк Бабура'],['Andijan State University','Andijon davlat universiteti','Андижанский государственный университет'],['Andijan Airport','Andijon aeroporti','Международный аэропорт Андижан'],['Andijan Railway Station','Andijon vokzali','Андижан вокзал']],
  }),

  Fergana: city({
    mahallas: [{ name: "Ma'rifat", aliases: ['Marifat','Маърифат','Марифат'], confidence: 'official' }],
    localAreas: [['Qirguli','Киргули','Қирғули','Киргили'],['Neftchi','Нефтчи','Нефтяник'],['Center','Markaz','Центр'],['Mustaqillik','Мустакиллик'],['Al-Fargoniy',"Al-Farg'oniy",'Аль-Фергани'],['Margilon Road',"Marg'ilon yo'li",'Маргиланское направление','Маргиланская'],['Railway Station area','Vokzal','Вокзал'],['Airport area','Aeroport','Аэропорт'],['University area','Университетский'],['Navoiy','Навои']],
    landmarks: [['Al-Fargoniy Park',"Al-Farg'oniy bog'i",'парк Аль-Фергани'],['Independence Square','Mustaqillik maydoni','площадь Независимости'],['Fergana International Airport',"Farg'ona xalqaro aeroporti",'Ферганский международный аэропорт','FEG'],['Fergana Railway Station',"Farg'ona vokzali",'Фергана вокзал']],
  }),

  Bukhara: city({
    mahallas: [
      { name: 'M. Narshaxiy', aliases: ['Narshaxiy','Наршахий','Наршахи','Muhammad Narshakhi'], confidence: 'official' },
      { name: 'S. Raximov nomli 17-MFY', aliases: ['S. Raximov','Sobir Raximov','Сабир Рахимов','Собир Рахимов','Рахимова','17-MFY','17 махалля'], confidence: 'official' },
    ],
    localAreas: [['Old City','Eski shahar','Старый город','Эски шахар'],['Center','Markaz','Центр'],['Lyabi Hauz','Labi Hovuz','Ляби-Хауз','Ляби Хауз','Лаби Ҳовуз'],['Gijduvon Road',"G'ijduvon yo'li",'Гиждуванская'],['Gazli Road',"Gazli yo'li",'Газлийское шоссе'],['Railway Station area','Вокзал'],['Bukhara-1','Buxoro-1','Бухара-1'],['Bukhara-2','Buxoro-2','Бухара-2'],['University area','Университетский'],['Namozgoh','Намозгох'],['Sharq','Шарк'],['Mohi Xosa','Мохи-Хоса']],
    landmarks: [['Bukhara Ark','Арк',"Ark qal'asi"],['Poi Kalon','Пои-Калян','Poi-Kalyan','Minorai Kalon','Минарет Калян'],['Lyabi Hauz','Ляби-Хауз','Labi Hovuz'],['Chor Minor','Чор-Минор'],['Bolo Hauz','Боло-Хауз','Bolo Hovuz'],['Samanids Mausoleum','Саманиды','Ismoil Somoniy maqbarasi'],['Sitorai Mohi Xosa','Ситораи Мохи Хоса'],['Bukhara International Airport','Buxoro xalqaro aeroporti','BHK']],
  }),

  Qarshi: city({
    mahallas: [
      { name: 'Navo', aliases: ['Наво'], confidence: 'official' },
      { name: 'Gungon', aliases: ['Гунгон','Гунган'], confidence: 'official' },
      { name: 'Buyuk Turon', aliases: ['Буюк Турон','Великий Туран','Great Turan'], confidence: 'official' },
    ],
    localAreas: [['Center','Markaz','Центр'],['Old City','Eski shahar','Старый город'],['Geolog','Геолог','Геологлар'],['Sharq','Шарк','Шарқ'],['Paxtazor','Пахтазор'],['Nasaf','Насаф'],['Qat','Кат'],['Railway Station area','Вокзал'],['Airport area','Аэропорт'],['University area','Университетский'],['Xonobod','Ханабад','Хонобод'],['Jayxun','Джейхун']],
    landmarks: [['Odina Mosque','Odina masjidi','мечеть Одина'],['Kokgumbaz',"Ko'kgumbaz",'Кок-Гумбаз'],['Qarshi Bridge','Qarshi ko‘prigi','Каршинский мост'],['Nasaf Stadium','Nasaf stadioni','стадион Насаф'],['Karshi Airport','Qarshi xalqaro aeroporti','KSQ'],['Qarshi Railway Station','Qarshi vokzali']],
  }),

  Nukus: city({
    mahallas: nukusMahallas,
    localAreas: [['Center','Orayliq','Марказ','Центр'],['Dosliq','Дослык',"Do'stlik"],['Beruniy area','Беруний','Beruniy'],['Qizketken','Кызкеткен','Кызылкеткен'],['Nayman','Найман'],['Samanbay','Саманбай'],['Turtkul Road','Турткульское шоссе',"To'rtko'l"],['Khojeyli Road','Ходжейлийское шоссе',"Xo'jayli"],['Airport area','Аэропорт'],['Railway Station area','Вокзал']],
    landmarks: [['Savitsky Museum','Государственный музей искусств им. Савицкого','Savitskiy muzeyi','I.V. Savitsky Museum'],['Berdakh Square','Berdax maydoni','площадь Бердаха'],['Karakalpak State University','Qoraqalpoq davlat universiteti','Каракалпакский государственный университет'],['Nukus Airport','Nukus aeroporti','Нукус аэропорт','NCU']],
  }),

  Urgench: city({
    mahallas: [
      { name: 'Mustaqillik', aliases: ['Мустакиллик','Мустақиллик','Независимость'], confidence: 'official' },
      { name: 'Feruz', aliases: ['Феруз'], confidence: 'official' },
      { name: "Ma'rifat", aliases: ['Marifat','Маърифат','Марифат','Просвещение'], confidence: 'official' },
      { name: "Yuqori bog'", aliases: ['Yuqori bog','Юкори бог'], confidence: 'official' },
      { name: 'Al Xorazmiy', aliases: ['Al-Xorazmiy','Al Khwarizmi','Аль-Хорезми','Ал Хоразмий'], confidence: 'official' },
      { name: 'Besh mergan', aliases: ['Beshmergan','Беш Мерган','Бешмерган'], confidence: 'official' },
      { name: 'Shodlik', aliases: ['Шодлик'], confidence: 'official' },
      { name: 'Gulshan', aliases: ['Гулшан'], confidence: 'official' },
      { name: 'Gulzor', aliases: ['Гулзор'], confidence: 'official' },
      { name: 'Navbahor', aliases: ['Navbahar','Навбахор'], confidence: 'official' },
      { name: 'Avesto', aliases: ['Avesta','Авесто','Авеста'], confidence: 'official' },
      { name: "Mash'al", aliases: ['Mashal','Машъал'], confidence: 'official' },
      { name: 'Yangi hayot', aliases: ['Yangi xayot','Янги хаёт','Янги Ҳаёт','Новая жизнь'], confidence: 'official' },
      { name: 'Ashxobod', aliases: ['Ashgabat','Ashkhabad','Ашхабад','Ашхобод'], confidence: 'official' },
      { name: 'Jingovuz', aliases: ['Jingovuz MFY','Жинговуз','Джинговуз'], confidence: 'official' },
    ],
    localAreas: [['Center','Markaz','Центр'],['Olimpiya','Олимпия'],['Railway Station area','Вокзал'],['Airport area','Аэропорт'],['University area','Университетский'],['Al-Xorazmiy area','Аль-Хорезми','Al-Xorazmiy'],['Navoiy','Навои'],['Gurlan Road','Гурленское шоссе','Gurlan'],['Khiva Road','Хивинское шоссе',"Xiva yo'li"]],
    landmarks: [['Al-Xorazmiy Monument','памятник Аль-Хорезми','Al-Xorazmiy'],['Urgench State University','Urganch davlat universiteti','Ургенчский государственный университет'],['Urgench International Airport','Urganch xalqaro aeroporti','UGC'],['Urgench Railway Station','Urganch vokzali']],
  }),

  Kokand: city({
    localAreas: [['Center','Центр','Markaz'],['Old City','Старый город','Eski shahar'],['Khudoyar Khan area','Худояр-хан','Xudoyorxon'],['Orda','Урда',"O'rda"],['Chorsu','Чорсу'],['Dangara Road','Дангара йули',"Dang'ara"],['Railway Station area','Вокзал']],
    landmarks: [['Kokand Railway Station',"Qo'qon vokzali"],['Khudoyar Khan Palace','Дворец Худояр-хана','Xudoyorxon saroyi'],['Jami Mosque','Джами','Jome masjidi'],['Norbutabiy Madrasa','Мадраса Норбута-бия','Norbutabiy madrasasi'],['Kokand Bazaar',"Qo'qon bozori",'Кокандский базар']],
  }),

  Margilan: city({
    localAreas: [['Center','Центр','Markaz'],['Old City','Старый город','Eski shahar'],['Kumtepa','Кумтепа'],['Yodgorlik','Ёдгорлик'],['Atlas','Атлас'],['Railway Station area','Вокзал']],
    landmarks: [['Kumtepa Bazaar','Кумтепинский базар','Kumtepa bozori'],['Yodgorlik Silk Factory','Yodgorlik silk factory'],['Margilan Railway Station',"Marg'ilon vokzali"]],
  }),

  Jizzakh: city({
    mahallas: [{ name: 'Ittifoq', aliases: ['Иттифок','Иттифоқ','Союз'], confidence: 'official' }],
    localAreas: [['Center','Markaz','Центр'],['Sangzor','Сангзор'],['Zilol','Зилол'],['Hamid Olimjon','Хамид Алимджан'],['Navoiy','Навои'],['Railway Station area','Вокзал'],['Airport area','Аэропорт']],
    landmarks: [['Jizzakh Pedagogical University','Jizzax davlat pedagogika universiteti','Джизакский педагогический университет'],['Sangzor River','Sangzor daryosi','река Сангзар']],
  }),

  Navoiy: city({
    mahallas: [{ name: 'Guliston', aliases: ['Гулистон'], confidence: 'official' }],
    microdistricts: numberedMicrodistricts([1,2,3,4,5,6,7,8,9,10,11,12]),
    localAreas: [['Uzbekiston Massiv',"O'zbekiston massivi",'Узбекистон массив','Ўзбекистон массиви'],['Yangi Navoiy','Янги Навои','Янги Навоий'],['Center','Markaz','Центр'],['Sputnik','Спутник'],['Railway Station area','Вокзал']],
    landmarks: [['Alisher Navoiy Park',"Alisher Navoiy bog'i",'парк Алишера Навои'],['Farhod Palace of Culture','Farhod madaniyat saroyi','Дворец культуры Фархад'],['Navoiy Mining and Metallurgical Company','Navoiy kon-metallurgiya kombinati','НГМК','NGMK','Навоийский ГМК'],['Navoi International Airport','Navoiy aeroporti','NVI']],
  }),

  Termez: city({
    mahallas: [{ name: 'Farxod', aliases: ['Farhod','Фарход','Фархад'], confidence: 'official' }],
    localAreas: [['Center','Markaz','Центр'],['Old Termez','Eski Termiz','Старый Термез'],['Northern Gate','Северные ворота'],['Railway Station area','Вокзал'],['Airport area','Аэропорт'],['University area','Университетский'],['Alpomish','Альпомиш'],["Navro'z",'Навруз'],['Qiziljar','Кызылжар','Қизилжар']],
    landmarks: [['Old Termez','Старый Термез','Eski Termiz'],['Fayoztepa','Фаяз-Тепе'],['Karatepa','Кара-Тепе'],['Sultan Saodat','Султан-Саодат'],['Hakim at-Termiziy','Хаким ат-Термизи'],['Amu Darya','Амударья','Amudaryo'],['Afghanistan Friendship Bridge','Мост Дружбы'],['Termez International Airport','Termiz xalqaro aeroporti','TMJ']],
  }),

  Gulistan: city({
    mahallas: [{ name: 'Sayqal', aliases: ['Сайкал','Сайқал'], confidence: 'official' }],
    microdistricts: numberedMicrodistricts([1,2,3,4]),
    localAreas: [['Center','Markaz','Центр'],['Dehqon Bazaar','Dehqon bozori','Дехканский рынок'],['University area','Университетский'],['Railway Station area','Вокзал']],
    landmarks: [['Gulistan State University','Guliston davlat universiteti','Гулистанский государственный университет'],['Central Stadium','Markaziy stadion','Центральный стадион'],['Gulistan Railway Station','Guliston vokzali']],
  }),

  Chirchiq: city({
    microdistricts: numberedMicrodistricts([1,2,3,4,5,6,7,8,9]),
    localAreas: [['Center','Markaz','Центр'],['Yubileiny','Юбилейный'],['Khimik','Химик'],['KhimGorodok','Химгородок'],['Mashinostroitel','Машиностроитель'],['Troitsky','Троицкий'],['Railway Station area','Вокзал'],['Bochka','Бочка'],['Olympic area','Олимпийский']],
    landmarks: [['Chirchiq River','Chirchiq daryosi','река Чирчик'],['Chirchiq Pedagogical University','Chirchiq davlat pedagogika universiteti','Чирчикский педагогический университет'],['Maxam-Chirchiq','Химкомбинат']],
  }),

  Almalyk: city({
    mahallas: [{ name: 'Kamalak', aliases: ['Камалак','Радуга'], confidence: 'official' }],
    microdistricts: numberedMicrodistricts([1,2,3,4,5]),
    localAreas: [['Center','Markaz','Центр'],['Old City','Eski shahar','Старый город'],['New City','Yangi shahar','Новый город'],['Metallurg','Металлург'],['Sports Palace area','Дворец спорта'],['Railway Station area','Вокзал']],
    landmarks: [['Almalyk MMC','АГМК','AGMK','ОКМК','OKMK','Олмалиқ КМК','Almalyk Mining and Metallurgical Complex'],['Metallurg Stadium','Metallurg stadioni','стадион Металлург']],
  }),

  Angren: city({
    microdistricts: numberedMicrodistricts([1,2,3,4,5]),
    localAreas: [['Center','Центр'],['Old Angren','Старый Ангрен','Эски Ангрен','Eski Angren'],['New Angren','Новый Ангрен','Yangi Angren'],['Dukent','Дукент'],['Geolog','Геолог'],['Railway Station area','Вокзал']],
    landmarks: [['Angren TPP','Angren IES','Ангренская ТЭС'],['Yangi Angren TPP','Yangi Angren IES','Ново-Ангренская ТЭС'],['Angren Railway Station','Angren vokzali']],
  }),

  Bekabad: city({
    localAreas: [['Center','Центр'],['Metallurg','Металлург'],['Tsementnik','Цементник'],['Vodnik','Водник'],['Syrdarya','Сырдарья','Sirdaryo'],['Farhod','Фархад'],['Railway Station area','Вокзал']],
    landmarks: [['Uzmetkombinat','Bekobod metallurgiya kombinati','Узметкомбинат'],['Farhod HPP','Фархадская ГЭС','Farhod GES']],
  }),

  Shakhrisabz: city({
    localAreas: [['Center','Центр'],['Old City','Старый город','Eski shahar'],['Oqsaroy','Оксарой','Ак-Сарай','Ak-Saray'],['Dorus Saodat','Дорус Саодат'],['Dorut Tilovat','Дорут Тиловат'],['Chorsu','Чорсу'],['Amir Temur','Амир Темур'],['Kitob direction','Китабское направление','Kitob'],['Railway Station area','Вокзал']],
  }),

  Khiva: city({
    localAreas: [['Ichan Kala','Ичан-Кала',"Ichan-Qal'a",'Ичан-Калъа'],['Dishan Kala','Дишан-Кала',"Dishan-Qal'a"],['Old City','Старый город','Eski shahar'],['New City','Новый город','Yangi shahar']],
    landmarks: [['Ichan Kala','Ичан-Кала','Ichan Kala'],['Kalta Minor','Кальта-Минор'],['Kunya Ark','Куня-Арк',"Ko'hna Ark"],['Islam Khodja','Ислам Ходжа',"Islom Xo'ja"],['Pahlavon Mahmud','Пахлаван Махмуд'],['Tosh Hovli','Таш-Хаули'],['Olloqulixon','Аллакулихан'],['Khiva Railway Station','Xiva vokzali','Хива вокзал']],
  }),

  Denov: city({ localAreas: [['Center','Markaz','Центр'],['Old Market','Старый рынок','Eski bozor'],['New Market','Новый рынок','Yangi bozor'],['Chaganiyon',"Chag'aniyon",'Чаганиан'],['Railway Station area','Вокзал']], landmarks: [['Denov Bazaar','Деновский базар','Denov bozori'],['Denov Arboretum','Дендрарий','Denov dendrariysi']] }),
  Asaka: city({ localAreas: [['Center','Markaz','Центр'],['Auto Plant area','Автозавод','Автозаводский'],['Old City','Старый город'],['Railway Station area','Вокзал']], landmarks: [['UzAuto Motors','UzAuto','GM Uzbekistan'],['Asaka Bank'],['Dehqon Bazaar','Dehqon bozori']] }),
  Kogon: city({ localAreas: [['Center','Центр'],['Railway Station area','Вокзал','Каган вокзал','Kogon vokzali','Бухара-1','Buxoro-1'],['Railway Workers','Железнодорожный','Темирйулчилар'],['Bukhara direction','Бухара направление']] }),
  Kattakurgan: city({ localAreas: [['Center','Markaz','Центр'],['Old City','Старый город','Eski shahar'],['Railway Station area','Вокзал','Каттакурган вокзал',"Kattaqo'rg'on vokzali"],['Bazaar','Базар','Dehqon bozori']], landmarks: [['Kattakurgan Reservoir','Каттакурганское водохранилище',"Kattaqo'rg'on suv ombori"]] }),
  Urgut: city({ localAreas: [['Center','Центр'],['Navoiy','Навои'],['Samarkand direction','Самаркандское направление','Samarqand yo‘li']], landmarks: [['Urgut Bazaar','Urgut bozori','Ургутский базар'],['Chor Chinor','Чорчинор','Chor-Chinor']] }),
  Yangiyol: city({ localAreas: [['Center','Центр'],['Railway Station area','Вокзал'],['Bazaar','Базар'],['Samarkand Highway','Самаркандское шоссе'],['Tashkent direction','Ташкентское направление']] }),
  Yangiyer: city({ microdistricts: numberedMicrodistricts([1,2,3,4]), localAreas: [['Center','центр'],['Railway Station area','вокзал','Yangiyer vokzali']] }),
  Shirin: city({ localAreas: [['Center','центр'],['Energetik','энергетик'],['Farhod','Фархад'],['Syrdarya','Сырдарья','Sirdaryo']], landmarks: [['Syrdarya TPP','Сырдарьинская ТЭС'],['HPP','ГЭС']] }),
  Gazalkent: city({ localAreas: [['Center','центр'],['Charvak direction','Чарвакское направление','Chorvoq'],['Bostanlyk direction','Бостанлык',"Bo'stonliq"]] }),
  Chartak: city({ localAreas: [['Center','центр'],['Namangan Road','Namangan yo‘li']], landmarks: [['Chartak Sanatorium','санаторий Чартак','Chortoq sanatoriysi'],['Market','рынок']] }),
  Chust: city({ localAreas: [['Center','центр']], landmarks: [['Chust Bazaar','Чустский базар','Chust bozori'],['Chust Knives','Чустские ножи','Chust pichoqlari'],['Doppi','Дуппи',"Do'ppi"]] }),
  Kosonsoy: city({ localAreas: [['Center','центр'],['Chust Road','Chust yo‘li']], landmarks: [["Mug qala","Mug' qal'a",'Муг-кала']] }),
  Khojeyli: city({ localAreas: [['Center','Центр'],['Bazaar','Базар'],['Nukus direction','Нукусское направление','Nukus yo‘li'],['Railway Station area','Вокзал']] }),
  Takhiatash: city({ localAreas: [['Center','центр']], landmarks: [['Takhiatash TPP','Тахиаташская ТЭС','Taxiatosh IES'],['Amu Darya','Амударья']] }),
  Kungrad: city({ localAreas: [['Center','центр'],['Railway Station area','вокзал',"Qo'ng'irot vokzali"],['Ustyurt direction','Устюртское направление'],['Muynak direction','Муйнакское направление']] }),
  Muynak: city({ landmarks: [['Ship Cemetery','кладбище кораблей','Кемалар қабристони'],['Aral Sea','Аральское море','Орол денгизи'],['Aral Sea Museum','Музей Аральского моря',"Mo'ynoq muzeyi"],['Aralkum','Аралкум']] }),
  Beruniy: city({ localAreas: [['Center','центр'],['Turtkul Road',"To'rtko'l yo'li",'Элликкала направление']], landmarks: [['Beruniy Bazaar','Берунийский базар']] }),
  Turtkul: city({ localAreas: [['Center','центр'],['Bazaar','базар'],['Railway Station area','вокзал']] }),
  Shahrixon: city({ localAreas: [['Center','центр'],['Market','рынок'],['Andijan direction','Андижанское направление']] }),
  Xonobod: city({ landmarks: [['Andijan Reservoir','Андижанское водохранилище','Andijon suv ombori'],['Xonobod Sanatorium','Ханабад санаторий','Xonobod sanatoriysi']] }),
});

export const UZ_AMBIGUOUS_LOCAL_NAMES = Object.freeze([
  'Center','Markaz','Navbahor','Mustaqillik','Shodlik','Guliston','Nukus','Xonobod','Farhod','Navoiy','Afrosiyob','Dosliq','Yangi hayot',
]);

export const UZ_KARAKALPAK_LANGUAGE_TAGS = Object.freeze(['kaa_lat','kaa_cyr']);
