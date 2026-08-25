import { aliasesToRegex } from './normalization.js';

function entry(name, aliases = [], meta = {}) {
  const all = [...new Set([name, ...aliases].filter(Boolean))];
  return Object.freeze({ name, aliases: Object.freeze(all), re: aliasesToRegex(all), ...meta });
}

function entries(rows = [], defaults = {}) {
  return Object.freeze(rows.map((row) => {
    if (Array.isArray(row)) return entry(row[0], row.slice(1), defaults);
    return entry(row.name, row.aliases || [], { ...defaults, ...row });
  }));
}

function city({ districts = [], microdistricts = [], residentialComplexes = [], landmarks = [], suburbs = [], localAreas = [] }) {
  return Object.freeze({
    ...(districts.length ? { districts: entries(districts, { entityType: 'district', country: 'KZ' }) } : {}),
    ...(microdistricts.length ? { microdistricts: entries(microdistricts, { entityType: 'microdistrict', country: 'KZ' }) } : {}),
    ...(localAreas.length ? { localAreas: entries(localAreas, { entityType: 'local_area', country: 'KZ' }) } : {}),
    ...(residentialComplexes.length ? { residentialComplexes: entries(residentialComplexes, { entityType: 'residential_complex', country: 'KZ' }) } : {}),
    ...(landmarks.length ? { landmarks: entries(landmarks, { entityType: 'poi', country: 'KZ' }) } : {}),
    ...(suburbs.length ? { suburbs: entries(suburbs, { entityType: 'suburb', country: 'KZ' }) } : {}),
  });
}

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const numberedMicrodistrict = (n, suffix = '') => {
  const id = `${n}${suffix}`;
  return [
    `${id} microdistrict`,
    `${id} микрорайон`, `${id} мкр`, `${id} мкр.`, `${id}мкр`, `${id} м-н`, `${id} м-н.`, `${id} микро`, `${id}-й мкр`, `${id} мкр-н`, `${id} ықшамаудан`,
  ];
};

export const KZ_LOCATION_EXTENSIONS = Object.freeze({
  Almaty: city({
    districts: [
      ['Alatau', 'Алатауский район', 'Алатау', 'Алатау ауданы'],
      ['Almaly', 'Алмалинский район', 'Алмалы', 'Алмалы ауданы'],
      ['Auezov', 'Ауэзовский район', 'Әуезов', 'Әуезов ауданы'],
      ['Bostandyk', 'Бостандыкский район', 'Бостандық', 'Бостандық ауданы'],
      ['Zhetysu', 'Жетысуский район', 'Жетісу', 'Жетісу ауданы'],
      ['Medeu', 'Медеуский район', 'Медеу', 'Медеу ауданы'],
      ['Nauryzbay', 'Наурызбайский район', 'Наурызбай', 'Наурызбай ауданы'],
      ['Turksib', 'Турксибский район', 'Түрксіб', 'Түрксіб ауданы'],
    ],
    microdistricts: [
      { name: 'Center', aliases: ['Центр', 'Старый центр', 'Старый город', 'Золотой квадрат', 'Golden Square', 'Тихий центр', 'Арбат', 'Жибек Жолы'], district: 'Almaly' },
      ...['Тастак','Тастақ','Тастак-1','Тастак-2','Тастак-3','Тастак-4'].map((x) => ({ name: x.replace('Тастақ','Тастак'), aliases: [x], district: 'Almaly' })),
      { name: 'Sairan', aliases: ['Сайран'], district: 'Almaly' },
      { name: 'Moskva Mall area', aliases: ['ТЦ Москва', 'Москва ТЦ'], district: 'Almaly', entityType: 'local_area' },
      { name: 'ADK area', aliases: ['АДК', 'ADK'], district: 'Almaly', entityType: 'local_area' },
      ...['Орбита','Орбита-1','Орбита-2','Орбита-3','Орбита-4'].map((x) => ({ name: x.replace('Орбита','Orbita'), aliases: [x], district: 'Bostandyk' })),
      ...['Коктем','Көктем','Коктем-1','Коктем-2','Коктем-3','Коктем-4'].map((x) => ({ name: x.replace('Көктем','Koktem').replace('Коктем','Koktem'), aliases: [x], district: 'Bostandyk' })),
      { name: 'Almagul', aliases: ['Алмагуль', 'Алмагүл'], district: 'Bostandyk' },
      { name: 'Kazakhfilm', aliases: ['Казахфильм', 'Kazakhfilm'], district: 'Bostandyk' },
      { name: 'Miras', aliases: ['Мирас'], district: 'Bostandyk' },
      { name: 'Nurlytau', aliases: ['Нурлытау', 'Нұрлытау'], district: 'Bostandyk' },
      { name: 'Ermensai', aliases: ['Ерменсай'], district: 'Bostandyk' },
      { name: 'Baganashyl', aliases: ['Баганашыл', 'Бағанашыл'], district: 'Bostandyk' },
      { name: 'Khan Tengri', aliases: ['Хан-Тенгри', 'Хан Тенгри', 'Хан Тәңірі'], district: 'Bostandyk' },
      { name: 'Remizovka', aliases: ['Ремизовка'], district: 'Bostandyk' },
      { name: 'Nur Alatau', aliases: ['Нур Алатау', 'Нұр Алатау'], district: 'Bostandyk' },
      { name: 'Gornyi Gigant', aliases: ['Горный Гигант'], district: 'Bostandyk' },
      ...['Самал','Самал-1','Самал-2','Самал-3'].map((x) => ({ name: x.replace('Самал','Samal'), aliases: [x], district: 'Medeu' })),
      ...['Думан','Думан-1','Думан-2'].map((x) => ({ name: x.replace('Думан','Duman'), aliases: [x], district: 'Medeu' })),
      { name: 'Kok-Tobe', aliases: ['Кок-Тобе', 'Көктөбе', 'Коктобе'], district: 'Medeu' },
      { name: 'Butakovka', aliases: ['Бутаковка'], district: 'Medeu' },
      { name: 'Medeu', aliases: ['Медеу'], district: 'Medeu' },
      { name: 'Kamenskoye Plato', aliases: ['Каменское плато'], district: 'Medeu' },
      ...['Кенсай','Кенсай-1','Кенсай-2','Кенсай-3'].map((x) => ({ name: x.replace('Кенсай','Kensai'), aliases: [x], district: 'Medeu' })),
      { name: 'Tatarka', aliases: ['Татарка'], district: 'Medeu' },
      { name: 'Malaya Stanitsa', aliases: ['Малая станица'], district: 'Medeu' },
      ...['Аксай','Ақсай','Аксай-1','Аксай-1А','Аксай-2','Аксай-2А','Аксай-3','Аксай-3А','Аксай-4'].map((x) => ({ name: x.replace('Ақсай','Aksai').replace('Аксай','Aksai'), aliases: [x], district: 'Auezov' })),
      ...range(1,7).map((n) => ({ name: `Mamyr-${n}`, aliases: [`Мамыр-${n}`, `Мамыр ${n}`], district: 'Auezov' })),
      { name: 'Mamyr', aliases: ['Мамыр'], district: 'Auezov' },
      ...range(1,3).map((n) => ({ name: `Zhetysu-${n}`, aliases: [`Жетысу-${n}`, `Жетісу-${n}`], district: 'Auezov' })),
      { name: 'Zhetysu', aliases: ['Жетысу', 'Жетісу'], district: 'Auezov' },
      ...range(1,3).map((n) => ({ name: `Taugul-${n}`, aliases: [`Таугуль-${n}`, `Таугүл-${n}`], district: 'Auezov' })),
      { name: 'Taugul', aliases: ['Таугуль', 'Таугүл'], district: 'Auezov' },
      { name: 'Sairan', aliases: ['Сайран'], district: 'Auezov' },
      { name: 'Akkent', aliases: ['Аккент', 'Ақкент', 'Aqqent'], district: 'Alatau' },
      { name: 'Sayaly', aliases: ['Саялы'], district: 'Alatau' },
      ...['Шанырак','Шаңырақ','Шанырак-1','Шанырак-2'].map((x) => ({ name: x.replace('Шаңырақ','Shanyrak').replace('Шанырак','Shanyrak'), aliases: [x], district: 'Alatau' })),
      ...['Улжан','Ұлжан','Улжан-1','Улжан-2'].map((x) => ({ name: x.replace('Ұлжан','Ulzhan').replace('Улжан','Ulzhan'), aliases: [x], district: 'Alatau' })),
      { name: 'Ozhet', aliases: ['Ожет', 'Өжет'], district: 'Alatau' },
      { name: 'Darkhan', aliases: ['Дархан'], district: 'Alatau' },
      { name: 'Tomiris', aliases: ['Томирис'], district: 'Alatau' },
      { name: 'Terekty', aliases: ['Теректы', 'Теректі'], district: 'Alatau' },
      { name: 'Rakhat', aliases: ['Рахат'], district: 'Alatau' },
      { name: 'Kurylysshy', aliases: ['Курылысшы', 'Құрылысшы'], district: 'Alatau' },
      { name: 'Madeniet', aliases: ['Мадениет', 'Мәдениет'], district: 'Alatau' },
      { name: 'Algabas', aliases: ['Алгабас', 'Алғабас'], district: 'Alatau' },
      { name: 'Shugyla', aliases: ['Шугыла', 'Шұғыла'], district: 'Nauryzbay' },
      ...['Калкаман','Қалқаман','Калкаман-1','Калкаман-2'].map((x) => ({ name: x.replace('Қалқаман','Kalkaman').replace('Калкаман','Kalkaman'), aliases: [x], district: 'Nauryzbay' })),
      { name: 'Kargaly', aliases: ['Каргалы', 'Қарғалы'], district: 'Nauryzbay' },
      { name: 'Tausamaly', aliases: ['Таусамалы'], district: 'Nauryzbay' },
      { name: 'Tastybulak', aliases: ['Тастыбулак', 'Тастыбұлақ'], district: 'Nauryzbay' },
      { name: 'Abai Dachas', aliases: ['Абайские дачи'], district: 'Nauryzbay' },
      { name: 'Kamenka', aliases: ['Каменка'], district: 'Nauryzbay' },
      { name: 'Kuramys', aliases: ['Курамыс', 'Құрамыс'], district: 'Nauryzbay' },
      { name: 'Akzhar', aliases: ['Акжар', 'Ақжар'], district: 'Nauryzbay' },
      { name: 'Karagaily', aliases: ['Карагайлы', 'Қарағайлы'], district: 'Nauryzbay' },
      { name: 'Zhailau', aliases: ['Жайлау'], district: 'Nauryzbay' },
      ...range(1,4).map((n) => ({ name: `Ainabulak-${n}`, aliases: [`Айнабулак-${n}`, `Айнабұлақ-${n}`], district: 'Zhetysu' })),
      { name: 'Ainabulak', aliases: ['Айнабулак', 'Айнабұлақ'], district: 'Zhetysu' },
      { name: 'Kulager', aliases: ['Кулагер', 'Құлагер'], district: 'Zhetysu' },
      { name: 'Kokzhiek', aliases: ['Кокжиек', 'Көкжиек'], district: 'Zhetysu' },
      { name: 'Pervomayka', aliases: ['Первомайка'], district: 'Zhetysu' },
      { name: 'Dorozhnik', aliases: ['Дорожник'], district: 'Zhetysu' },
      { name: 'Nizhnyaya Pyatiletka', aliases: ['Нижняя Пятилетка'], district: 'Zhetysu' },
      { name: 'Zhuldyz', aliases: ['Жулдыз', 'Жұлдыз'], district: 'Turksib' },
      ...[1,2].map((n) => ({ name: `Zhuldyz-${n}`, aliases: [`Жулдыз-${n}`, `Жұлдыз-${n}`], district: 'Turksib' })),
      { name: 'Mayak', aliases: ['Маяк'], district: 'Turksib' },
      { name: 'Almerek', aliases: ['Альмерек', 'Әлмерек'], district: 'Turksib' },
      { name: 'Kairat', aliases: ['Кайрат', 'Қайрат'], district: 'Turksib' },
      { name: 'Turksib', aliases: ['Турксиб'], district: 'Turksib' },
      { name: 'Nizhnyaya Pyatiletka', aliases: ['Нижняя Пятилетка'], district: 'Turksib' },
      { name: 'Airport', aliases: ['Аэропорт'], district: 'Turksib' },
      { name: 'Almaty-1', aliases: ['Станция Алматы-1', 'Алматы-1'], district: 'Turksib' },
      { name: 'Zhas Kanat', aliases: ['Жас Канат', 'Жас Қанат'], district: 'Turksib' },
    ],
    localAreas: [
      ['Golden Square', 'Золотой квадрат', 'Золотой Квадрат'], ['Quiet Center', 'Тихий центр'], ['VDNKh', 'ВДНХ'], ['Atakent area', 'Атакент', 'Atakent'],
      ['Kompot', 'Компот'], ['Old Square', 'Старая площадь'], ['New Square', 'Новая площадь'], ['Arbat', 'Арбат'],
    ],
    residentialComplexes: [
      ['Esentai City'],['Esentai Apartments'],['Esentai Park'],['Apple Town'],['Apple City'],['Mega Towers','Mega Tower'],['Metropole','Metropole Residence'],
      ['Central Avenue','Central Avenue Residence'],['Dostyk Residence'],['Dostyk Plaza Residence'],['Exclusive Star'],['Exclusive Time'],['Exclusive Residence'],
      ['Rams City','RAMS City'],['RAMS Garden'],['RAMS Beyond'],['RAMS Signature'],['Koktobe City'],['Koktobe Hills'],['Mountain Drive'],['Mountain Park'],
      ['Remizovka'],['Gagarin Park'],['Gagarin Terrace'],['Green City'],['Green Plaza'],['Braun','Braun Residence'],['Presidents Park',"President's Park",'President Park'],
      ['4YOU'],['4YOU Business'],['4YOU Comfort'],['Orion','Orion Residence'],['Alma City'],['Alma City 5'],['Alma City 6'],['Alma City 7'],
      ['Akbulak Hills','Ақбұлақ'],['AFD Plaza'],['Symphony'],['Symphony 3'],['Hyde Park'],['Park Avenue'],['Avenue'],['Terracotta'],['Terracotta Park'],
    ],
    landmarks: [
      ['Medeu','Медеу'],['Shymbulak','Шымбулак','Чимбулак'],['Kok-Tobe','Кок-Тобе','Көктөбе','Kok Tobe'],['Big Almaty Lake','Большое Алматинское озеро','БАО'],
      ['Panfilov Park','парк 28 панфиловцев'],['Gorky Park','Парк Горького','Центральный парк'],['Botanical Garden','Ботанический сад'],['Atakent','Атакент'],
      ['Republic Square','площадь Республики','Республика алаңы'],['Palace of the Republic','Дворец Республики'],['Arbat','Арбат','Жибек Жолы'],['Green Bazaar','Зеленый базар','Зелёный базар','Көк базар'],
      ['Almaty Arena'],['Halyk Arena'],['Central Stadium','Центральный стадион'],['MEGA Alma-Ata','MEGA Center Alma-Ata'],['MEGA Park'],['Dostyk Plaza'],['Esentai Mall'],
      ['Forum Almaty','Forum'],['Atakent Mall'],['Aport Mall','Aport','Aport East'],['Moskva Mall','Moskva','Москва'],['Grand Park'],['Globus'],['ADK','АДК'],
    ],
    suburbs: [
      ['Besagash','Бесагаш','Бесағаш','Бесагаш Алматы'],['Talgar','Талғар','Талгар'],['Kaskelen','Қаскелең','Каскелен'],['Irgeli','Іргелі','Иргели'],
      ['Otegen Batyr','Өтеген батыр','Отеген Батыр','Энергетический','Энергетический посёлок'],['Boraldai','Боралдай','Бурундай','Burundai'],
      ['Kyrgauyldy','Қырғауылды','Кыргауылды'],['Tuzdybastau','Тұздыбастау','Туздыбастау','Калинино'],['Almalybak','Алмалыбақ','Алмалыбак'],
      ['Kemertogan','Кемертоған','Кемертоган'],['Guldala','Гүлдала','Гульдала'],['Baiserke','Байсерке'],['Raiymbek','Райымбек'],
    ],
  }),

  Astana: city({
    districts: [
      ['Almaty','Алматы район','Алматы ауданы'],['Baikonur','Байконур','Байқоңыр','Байқоңыр ауданы'],['Esil','Есиль','Есіл','Есіл ауданы'],
      ['Nura','Нура','Нұра','Нұра ауданы'],['Saraishyk','Сарайшык','Сарайшық','Сарайшық ауданы'],['Saryarka','Сарыарка','Сарыарқа','Сарыарқа ауданы'],
    ],
    microdistricts: [
      ['South-East','Юго-Восток'],['South-East Right','Юго-Восток правая сторона'],['South-East Left','Юго-Восток левая сторона'],['Old City','Старый город','Старый центр'],
      ['New Center','Новый центр','Административный центр'],['Left Bank','Левый берег','Левобережье','Сол жағалау'],['Right Bank','Правый берег','Правобережье','Оң жағалау'],
      ['Chubary','Чубары','Шубар','Шұбар'],['Komsomolsky','Комсомольский'],['Koktal','Коктал','Көктал'],['Koktal-1','Коктал-1'],['Koktal-2','Коктал-2'],
      ['Urker','Уркер','Үркер'],['Ondiris','Ондирис','Өндіріс'],['Industrial','Промышленный'],['Zheleznodorozhny','Железнодорожный','Железнодорожный жилой массив'],
      ['International','Интернациональный'],['Michurino','Мичурино'],['Kuigenzhar','Куйгенжар','Күйгенжар'],['Prigorodny','Пригородный','Пригородный жилой массив'],
      ['Telmana','Тельмана'],['Ilyinka','Ильинка'],['Zarechny','Заречный','Заречный жилой массив'],['Agrogorodok','Агро-городок','Агрогородок'],
      ['Molodezhny','Молодежный','Молодёжный'],['Tselinny','Целинный','Целинный микрорайон'],['Kirpichny','Кирпичный'],['Kazgorodok','Казгородок'],
      ['EXPO area','EXPO','Экспо'],['Botanical Garden area','Ботанический сад'],['Green Quarter area','Зеленый квартал','Зелёный квартал'],
      ['Millennium Alley','Аллея Тысячелетия','Аллея Мыңжылдық','Мынжылдык','Мыңжылдық'],['Turan area','Туран'],['Mangilik El area','Мәңгілік Ел'],['Saraychik area','Сарайшык','Сарайшық'],
    ],
    residentialComplexes: [
      ['Highvill','Highvill Astana'],['Highvill Ishim'],['Highvill Park'],['Grand Alatau'],['Northern Lights','Северное сияние'],['Lazurny Kvartal','Лазурный квартал'],
      ['Triumph','Триумфальный','Триумф Астаны'],['Talan Towers'],['Abu Dhabi Plaza'],['Green Quarter','Зеленый квартал','Зелёный квартал'],['Expo Boulevard'],['Expo Residence'],
      ['Expo Town'],['Promenade Expo'],['Nova City','Nova City на Туране'],['Sezim Qala','Сезім Қала'],['Sat City'],['Sat City K7'],['Apple City'],['Millennium Park'],['Millennium Alley'],
      ['Family Town'],['Family Village'],['Athletic City'],['Capital Park'],['Sensata Park'],['Sensata City'],['BI City'],['BI Village'],['Jetisu'],['Jetisu Park'],['Aq-Didar','Ak Didar'],
      ['Arai Apartments'],['Manhattan','Manhattan Astana'],['Sarmat'],['Sarmat 2'],['Inju City'],['Inju Promenade'],['Inju Arena'],['Tokyo','Tokyo Residence'],['London','London Residence'],
      ['Paris','Paris Residence'],['Monaco'],['Florence'],['Vienna'],['Venice'],['Gagarin Park'],['Gagarin Terrace'],['Akbulak Riviera','Акбулак','Ақбұлақ'],['Akbulak Life'],['Jagalau','Жагалау'],
    ],
    landmarks: [
      ['Baiterek','Байтерек','Бәйтерек'],['Khan Shatyr','Хан Шатыр'],['EXPO','Экспо'],['Nur Alem','Нур Алем','Нұр Әлем'],['Hazret Sultan Mosque','Мечеть Хазрет Султан','Әзірет Сұлтан'],
      ['Astana Grand Mosque','Главная мечеть'],['Ak Orda','Ак Орда','Ақорда'],['Palace of Peace and Reconciliation','Дворец мира и согласия','Пирамида'],['Ishim Embankment','Набережная Ишима','Есиль','Ishim'],
      ['Astana Botanical Garden','Ботанический сад'],['Central Park','Центральный парк'],['Triathlon Park','Триатлон парк'],['Presidential Park','Президентский парк'],['Astana Arena','Астана Арена'],['Barys Arena','Барыс Арена'],
      ['Mega Silk Way','MEGA Silk Way'],['Keruen','Керуен'],['KeruenCity'],['Asia Park'],['Abu Dhabi Plaza'],['Saryarka Mall','Saryarka','Сарыарка'],['Eurasia','Евразия'],
    ],
    suburbs: [
      ['Kosshy','Қосшы','Косшы','Qosshy','Косшы Астана','пригород Астаны'],['Lesnaya Polyana','Лесная Поляна','Лесная поляна','Орманды','Kosshy Лесная Поляна'],
      ['Taitobe','Тайтөбе','Тайтобе','Taytobe'],['Karaotkel','Қараөткел','Караоткель'],['Ilyinka','Ильинка','Ильинка Астана'],['Koyandy','Қоянды','Коянды'],['Talapker','Талапкер'],['Karazhar','Қаражар','Каражар'],
    ],
  }),

  Shymkent: city({
    districts: [['Abai','Абайский','Абай'],['Al-Farabi','Аль-Фарабийский','Әл-Фараби'],['Enbekshi','Енбекшинский','Еңбекші'],['Karatau','Каратауский','Қаратау'],['Turan','Туранский','Тұран']],
    microdistricts: [
      ['Nursat','Нурсат','Нұрсәт'],['Turan','Туран','Тұран'],['Shymcity','Шымсити','Shymkent City'],['Akzhaiyk','Акжайык','Ақжайық'],['Bozaryk','Бозарык','Бозарық'],['Samal','Самал'],
      ['Saule','Сәуле','Сауле'],['Kazygurt','Казыгурт','Қазығұрт'],['Turlan','Турлан','Тұрлан'],['Badam','Бадам'],['Badam-1','Бадам-1'],['Badam-2','Бадам-2'],['Akzhar','Акжар','Ақжар'],
      ['Kulager','Кулагер','Құлагер'],['Kokbulak','Кокбулак','Көкбұлақ'],['Karabastau','Карабастау','Қарабастау'],['Kursai','Курсай','Құрсай'],['Sairam','Сайрам'],['Asar','Асар'],['Asar-1','Асар-1'],['Asar-2','Асар-2'],
      ['Dostyk','Достык','Достық'],['Kaitpas','Кайтпас','Қайтпас'],['Kaitpas-1','Кайтпас-1'],['Kaitpas-2','Кайтпас-2'],['Tassai','Тассай'],['Tasken','Таскен'],['Zabadam','Забадам'],['Yntymak','Ынтымак','Ынтымақ'],
      ['Kyzylzhar','Кызылжар','Қызылжар'],['Otyrar','Отырар'],['North','Север','Северный'],['East','Восток','Восточный'],['North-West','Северо-Запад'],
      ...[11,12,16,17,18,19,20,21,22,23,24].map((n) => numberedMicrodistrict(n)),
    ],
    residentialComplexes: [['Otau City'],['Otau City 2'],['Shymkent City'],['Tulpar City'],['Nursat'],['Nursat City'],['Arman City'],['Arman Qala'],['Tumar Apartments'],['Tumar Residence'],['Royal Park'],['Royal Residence'],['Grand Park'],['Grand City'],['Capital City'],['Family Park'],['Al-Farabi'],['Al-Farabi Residence'],['Tauke Khan'],['Tauke Khan Residence']],
    landmarks: [['Shymkent Dendropark','Дендропарк','Шымкентский дендропарк'],['Abai Park','парк Абая'],['Independence Park','парк Независимости','Тәуелсіздік саябағы'],['Ordabasy Square','площадь Ордабасы','Ордабасы'],['Shymkent Arbat','Арбат'],['Shymqala Citadel','Цитадель','Shymqala','Шымкала'],['Shymkent Zoo','Зоопарк'],['Nauryz Park','Наурыз парк'],['Baidibek Bi','Байдибек би','Байдібек би']],
  }),

  Karaganda: city({
    districts: [['Kazybek Bi','Казыбек би','Қазыбек би'],['Alikhan Bokeikhan','Алихан Бокейхан','Әлихан Бөкейхан','Октябрьский район']],
    microdistricts: [
      ['Center','Центр'],['New City','Новый город'],['South-East','Юго-Восток'],['South-East-1','Юго-Восток-1'],['South-East-2','Юго-Восток-2'],
      ...range(1,4).map((n) => [`Stepnoy-${n}`,`Степной-${n}`]),['Stepnoy','Степной'],['Gulder','Гульдер','Гүлдер'],['Gulder-1','Гульдер-1'],['Gulder-2','Гульдер-2'],
      ['Orbita','Орбита'],['Orbita-1','Орбита-1'],['Orbita-2','Орбита-2'],['Vostok','Восток'],['Vostok-1','Восток-1'],['Vostok-2','Восток-2'],['Vostok-3','Восток-3'],
      ['Golubye Prudy','Голубые Пруды','Голубые пруды'],['Fedorovka','Федоровка'],['Mikhailovka','Михайловка'],['Maikuduk','Майкудук','Майқұдық'],['Prishakhtinsk','Пришахтинск'],['Sortirovka','Сортировка'],
      ['Old City','Старый город'],['Finskiy','Финский'],['Berlin','Берлин'],['Kirzavod','Кирзавод'],['Kuryanovsky','Курьяновский'],['Novaya Tikhonovka','Новая Тихоновка'],['Tikhonovka','Тихоновка'],
      ...['11А','12','13','14','15','16','17','18','19','20','23'].map((n) => numberedMicrodistrict(n)),
    ],
    residentialComplexes: [['Green City'],['Senator Park'],['Senator'],['Oasis'],['Oasis City'],['Triumf','Триумф'],['Keremet','Керемет'],['Arman','Арман'],['British Quarter','Британский квартал'],['London','London Residence'],['French House','Французский дом']],
    landmarks: [['Central Park','Центральный парк'],['Victory Park','парк Победы'],['Miners Palace','Дворец шахтеров','Дворец шахтёров'],['Shakhter Stadium','Шахтёр'],['Buketov University','КарГУ','Букетов университет'],['Anet Baba Mosque','мечеть Анета баба'],['Karaganda Railway Station','вокзал Караганда']],
  }),

  Aktobe: city({
    districts: [['Astana','Астана район'],['Almaty','Алматы район']],
    microdistricts: [
      ['Center','Центр'],['Old City','Старый город'],['New City','Новый город'],['Zhilgorodok','Жилгородок'],['Aviagorodok','Авиагородок'],['Moskva','Москва'],['Bolashak','Болашак','Болашақ'],
      ['Batys','Батыс'],['Batys-1','Батыс-1'],['Batys-2','Батыс-2'],['Batys-3','Батыс-3'],['Nur Aktobe','Нур Актобе','Нұр Ақтөбе'],['Kargaly','Каргалы','Қарғалы'],
      ['Zarechny','Заречный'],['Zarechny-1','Заречный-1'],['Zarechny-2','Заречный-2'],['Zarechny-3','Заречный-3'],['Kirpichny','Кирпичный'],['Sazdy','Сазды'],['Kurashasai','Курашасай'],['Akzhar','Акжар','Ақжар'],['Kyzylzhar','Кызылжар','Қызылжар'],
      ...['5','8','11','12','12А','15'].map((n) => numberedMicrodistrict(n)),
    ],
    residentialComplexes: [['Green Land'],['Green Park'],['Aktobe City'],['Aktobe Azhary','Ақтөбе Ажары'],['Bavaria','Bavaria Residence'],['Royal','Royal Park'],['Family Park'],['Capital'],['Grand','Grand City'],['Avenue','Avenue 5'],['Central Park']],
    landmarks: [['First President Park','парк Первого Президента'],['Central Park','Центральный парк'],['Nur Gasyr Mosque','Нур Гасыр','Нұр Ғасыр','мечеть Нур Гасыр'],['Aktobe Arena','Актобе Арена'],['Mega Aktobe']],
  }),

  Aktau: city({
    microdistricts: [
      ...range(1,41).filter((n) => n !== 0).map((n) => numberedMicrodistrict(n)),
      numberedMicrodistrict(3,'A'),numberedMicrodistrict(12,'A'),numberedMicrodistrict(31,'A'),numberedMicrodistrict(32,'A'),
    ],
    suburbs: [['Baskudyk','Баскудык','Басқұдық'],['Atameken','Атамекен'],['Munaily','Мунайлы','Мұнайлы'],['Mangystau','Мангистау','Маңғыстау'],['Batyr','Батыр'],['Daulet','Даулет','Дәулет'],['KyzylTobe','Кызылтобе','Қызылтөбе'],['Umirzak','Умирзак','Өмірзақ']],
    residentialComplexes: [['Green Plaza'],['Green Park'],['Aktau Riviera'],['Riviera'],['Florence','Florence Residence'],['Caspian Riviera'],['Caspian Palace'],['Caspian Tower'],['Aktau Towers'],['Aktau City'],['Grand Nur Plaza'],['Grand Victory'],['President','President Residence'],['Family Town'],['Prime Park'],['Prime Residence']],
    landmarks: [['Caspian Sea','Каспийское море','Каспий'],['Rock Trail','Скальная тропа'],['Embankment','набережная'],['Lighthouse','Маяк'],['TRK Aktau','ТРК Актау'],['Aktau Mall'],['Halyk Arena'],['Botanical Garden','Ботанический сад']],
  }),

  Atyrau: city({
    microdistricts: [['Center','Центр'],['Old City','Старый город'],...range(1,4).map((n) => [`Avangard-${n}`,`Авангард-${n}`]),['Avangard','Авангард'],['Nursaya','Нурсая','Нұрсая'],['Samal','Самал'],['Sarykamys','Сарыкамыс','Сарықамыс'],['Zhilgorodok','Жилгородок'],['Privokzalny','Привокзальный'],['Privokzalny-1','Привокзальный-1'],['Privokzalny-2','Привокзальный-2'],['Balykshi','Балыкши','Балықшы'],['Almagul','Алмагуль','Алмагүл'],['Kokarna','Кокарна','Көкарна'],['Bereke','Береке'],['Zhumysker','Жумыскер','Жұмыскер'],['Tomarly','Томарлы'],['Erkinkala','Еркинкала','Еркінқала'],['Geolog','Геолог'],['Khimpeselok','Химпоселок','Химпосёлок'],['Leskhoz','Лесхоз'],['Kurilkino','Курилкино']],
    residentialComplexes: [['Riviera Residence'],['Riverside'],['River Park'],['Infinity','Infinity Residence'],['French Quarter','Французский квартал'],['Grand Atyrau'],['Grand Park'],['Family Town'],['Talan','Talan Residence'],['Zaman','Zaman Residence'],['Caspian','Caspian Residence'],['Nursaya','Nursaya City']],
    landmarks: [['Ural River','река Урал','Жайық'],['Pedestrian Bridge','пешеходный мост'],['Embankment','набережная'],['Isatay-Makhambet Square','площадь Исатая-Махамбета'],['Imangali Mosque','мечеть Имангали'],['Atyrau Bridge'],['Baizaar'],['Infinity Mall']],
  }),

  Pavlodar: city({
    microdistricts: [['Center','Центр'],['Usolka','Усолка','Усольский'],['Dachny','Дачный'],['Vtoroy Pavlodar','Второй Павлодар'],['Vtoroy Pavlodar-1','Второй Павлодар-1'],['Vostochny','Восточный'],['Vostochny-1','Восточный-1'],['Vostochny-2','Восточный-2'],['Zelenstroy','Зеленстрой'],['KhimGorodki','Химгородки','Химгородок'],['Lesozavod','Лесозавод'],['Radiozavod','Радиозавод'],['Alyuminstroy','Алюминстрой'],['MDS','МДС'],['Saryarka','Сарыарка','Сарыарқа'],['Dostyk','Достык','Достық'],['Zhana Aul','Жана Ауыл','Жаңа ауыл'],['Ladozhskaya','Ладожская'],['Kamzina','Камзина'],['Nazarbayeva','Назарбаева'],['Torgovy Gorod','Торговый город']],
    residentialComplexes: [['Dostyk','Достык'],['Saryarka','Сарыарка'],['Ertis','Ертіс','Irtysh'],['Grand','Grand Avenue'],['Riverside'],['River Park'],['Family','Family Town']],
    landmarks: [['Irtysh Embankment','набережная Иртыша','Ертіс','Irtysh'],['Gagarin Park','парк Гагарина'],['Annunciation Cathedral','Благовещенский собор'],['Mashkhur Zhusup Mosque','мечеть Машхур Жусуп'],['Batyr Mall'],['Pavlodar Railway Station','Павлодар вокзал']],
  }),

  Oskemen: city({
    microdistricts: [['Center','Центр'],['KShT','КШТ','КШТ район'],['Ablaketka','Аблакетка'],['Zashchita','Защита'],['Sogra','Согра'],['Novaya Sogra','Новая Согра'],['Staraya Sogra','Старая Согра'],['Menovnoe','Меновное'],['Akhmerovo','Ахмерово'],['Prokhladnaya','Прохладная'],['Strelka','Стрелка'],['DKM','ДКМ'],['Pristan','Пристань'],['Mirny','Мирный'],['Metallurg','Металлург'],['Babkina Melnitsa','Бабкина мельница'],['Zaulbinka','Заульбинка'],['Oktyabrsky','Октябрьский'],['Central Market','Центральный рынок'],['Ulba','Ульбинский','Үлбі']],
    residentialComplexes: [['Grand City'],['Riviera'],['Ertis','Irtysh'],['Green Park'],['Altai','Altay'],['Central'],['Panorama','Panorama Park']],
    landmarks: [['Irtysh','Иртыш','Ертіс'],['Ulba','Ульба','Үлбі'],['Strelka','Стрелка'],['Zhastar Park','парк Жастар'],['Ethnopark','этнопарк'],['Sports Palace','Дворец спорта'],['Oskemen Railway Station','Усть-Каменогорский вокзал'],['Oskemen Airport']],
  }),

  Semey: city({
    microdistricts: [['Center','Центр','Центральный'],['Zarya','Заря'],['Vostochny','Восточный'],['Karagaily','Карагайлы','Қарағайлы'],['Energetik','Энергетик'],['Tsempeselok','Цемпоселок','Цемпосёлок'],['Novostroyka','Новостройка'],['Krasny Kordon','Красный Кордон','Красный кордон'],['Yunost','Юность'],['Mirny','Мирный'],['Vodny','Водный'],['Bobrovka','Бобровка'],['Zaton','Затон'],['Pristan','Пристань'],['343 Quarter','343 квартал'],['72 Quarter','72 квартал'],['35 Quarter','35 квартал'],['Stepnoy','Степной'],['Tatarsky Krai','Татарский край']],
    residentialComplexes: [['Karagai','Қарағайлы'],['Semey City'],['Ertis','Irtysh'],['Grand'],['Family']],
    landmarks: [['Irtysh','Иртыш','Ертіс'],['Semey Bridge','подвесной мост','Семейский мост'],['Polkovnichiy Island','остров Полковничий'],['Abai Museum','музей Абая','Абай музейі'],['Nevzorov Museum','Невзоров музейі','музей Невзоровых']],
  }),

  Kostanay: city({
    microdistricts: [['Center','Центр'],['KSK','КСК'],['KZhBI','КЖБИ'],['Airport','Аэропорт'],['Nauryz','Наурыз'],['Yubileiny','Юбилейный'],['North-West','Северо-Западный','Северо-Запад'],['Bereke','Береке'],['Amangeldy','Амангельды','Амангелді'],['Druzhba','Дружба'],['Kievsky','Киевский'],['Uzkaya Koleya','Узкая колея'],['Military Town','Военный городок'],['Bus Station','Автовокзал'],['Narimanovsky Market','Наримановский рынок'],['Kostanay-2','Костанай-2']],
    residentialComplexes: [['Riviera'],['Arman','Арман'],['Sultan','Султан'],['Family','Family Park'],['City','City Park'],['Grand']],
  }),

  Kyzylorda: city({
    microdistricts: [['Center','Центр'],['Akmeshit','Акмешит','Ақмешіт'],['Arai','Арай'],['Shugyla','Шугыла','Шұғыла'],['Titov','Титов'],['Merei','Мерей'],['Saulet','Саулет','Сәулет'],['Syrdarya','Сырдарья','Сырдария'],['KBI','КБИ'],['Komsomol','Комсомол'],['Gagarina','Гагарина'],['SPMK-70','СПМК-70'],['Shanghai','Шанхай'],['Kyzylzharma','Кызылжарма','Қызылжарма'],['Tasboget','Тасбогет','Тасбөгет'],['Belkol','Белкуль','Белкөл']],
    residentialComplexes: [['Syrdariya','Сырдария'],['Orda','Орда'],['Akmeshit','Ақмешіт'],['Arai','Арай'],['Zaman','Заман']],
    landmarks: [['Syr Darya','Сырдарья'],['Central Square','Центральная площадь'],['First President Park','парк Первого Президента'],['Korkyt Ata','Коркыт Ата','Қорқыт Ата'],['Aray City Mall']],
  }),

  Oral: city({
    microdistricts: [['Center','Центр'],['Old City','Старый город'],['North-East','Северо-Восток'],['North-East-1','Северо-Восток-1'],['North-East-2','Северо-Восток-2'],['North-East-2A','Северо-Восток-2А'],['North-East-3','Северо-Восток-3'],['Stroitel','Строитель'],['Omega','Омега'],['Zachagansk','Зачаганск'],['Zhana Orda','Жана Орда','Жаңа Орда'],['Sarytau','Сарытау'],['Samal','Самал'],['Derkul','Деркул'],['Krugloozernoe','Круглоозёрное','Круглоозерное'],['Ptitsefabrika','Птицефабрика'],['Old Airport','Старый аэропорт'],['New Airport','Новый аэропорт'],['Railway Station','ЖД вокзал']],
    residentialComplexes: [['Zhana Orda','Жана Орда','Жаңа Орда'],['Samal','Самал'],['Grand','Grand City'],['Family','Family Park'],['Riverside','River Park'],['Zaman']],
    landmarks: [['Ural River','Урал','Жайық'],['Chagan','Чаган','Шаған'],['Abai Square','площадь Абая'],['Kirov Park','парк Кирова'],['First President Park','парк Первого Президента'],['Asia Mall']],
  }),

  Taraz: city({
    microdistricts: [['Center','Центр'],['Asa','Аса'],['Zhansaya','Жансая'],['Samal','Самал'],['Karatau','Каратау','Қаратау'],['Talas','Талас'],['Zhailau','Жайлау'],['Saltanat','Салтанат'],['Mynbulak','Мынбулак','Мыңбұлақ'],['Arai','Арай'],['Baiterek','Бәйтерек'],['Baryskhan','Барысхан'],['Kumshagal','Кумшагал','Құмшағал'],['Sholdala','Шолдала','Шөлдала']],
    landmarks: [['Tekturmas','Тектурмас'],['Karakhan Mausoleum','мавзолей Карахана'],['Aisha Bibi','Айша-Биби'],['Babaji Khatun','Бабаджа-хатун'],['First President Park','парк Первого Президента'],['Central Park','Центральный парк'],['Mart'],['Taraz Arena','Тараз Арена']],
  }),

  Petropavl: city({ microdistricts: [['Center','Центр'],...['19','20'].map((n)=>numberedMicrodistrict(n)),['Bereke','Береке'],['Zhas Orken','Жас Оркен','Жас Өркен'],['Podgora','Подгора'],['Benzostroy','Бензострой'],['Rabochiy','Рабочий'],['Privokzalny','Привокзальный'],['Cheremushki','Черемушки'],['Zarechny','Заречный'],['Novy Svet','Новый свет'],['Solnechny','Солнечный']] }),
  Taldykorgan: city({ microdistricts: [['Center','Центр'],['Karatal','Каратал','Қаратал'],['Zhastar','Жастар'],['Samal','Самал'],['Koktem','Көктем'],['Vostochny','Восточный'],['South-West','Юго-Западный'],['Musheltoy','Мушелтой','Мүшелтой'],['Erkin','Еркин'],['Otenai','Өтенай','Отенай']] }),
  Temirtau: city({ microdistricts: [['Center','Центр'],['Old City','Старый город'],['New City','Новый город'],['Vostok','Восток'],['Sotsgorod','Соцгород'],...range(6,9).map((n)=>numberedMicrodistrict(n)),['Metallurg','Металлург'],['Right Bank','Правый берег']], landmarks: [['Qarmet','Кармет','АрселорМиттал Темиртау','металлургический комбинат']] }),
  Ekibastuz: city({ microdistricts: [['Center','Центр'],...range(5,15).map((n)=>numberedMicrodistrict(n)),numberedMicrodistrict(18),['Shakhtersky','Шахтерский'],['Gornyak','Горняк']], landmarks: [['GRES-1','ГРЭС-1','Экибастузская ГРЭС-1'],['GRES-2','ГРЭС-2'],['Bogatyr','Богатырь','разрез Богатырь']] }),
  Rudny: city({ microdistricts: [['Center','Центр'],['Old City','Старый город'],...range(1,11).map((n)=>numberedMicrodistrict(n)),numberedMicrodistrict(13),numberedMicrodistrict(14),numberedMicrodistrict(15)], landmarks: [['SSGPO','ССГПО','Соколовско-Сарбайское'],['Gornyak','Горняк']] }),
  Zhezkazgan: city({ microdistricts: [['Center','Центр'],['Vostochny','Восточный'],['Zapadny','Западный'],['Rybachiy','Рыбачий'],['Kombinatsky','Комбинатский'],['Geologichesky','Геологический'],...range(1,5).map((n)=>numberedMicrodistrict(n))] }),
  Balkhash: city({ microdistricts: [['Center','Центр'],['Old City','Старый город'],['Pristantsionny','Пристанционный'],['Konyrat','Конырат','Қоңырат'],['Rembaza','Рембаза'],['Vostochny','Восточный'],['BGMK','БГМК']], landmarks: [['Lake Balkhash','озеро Балхаш','Балқаш көлі'],['Embankment','набережная'],['BGMK','БГМК']] }),
  Turkistan: city({ microdistricts: [['Center','Центр'],['Old Turkistan','Старый Туркестан'],['New City','Новый город','Новый Туркестан','Жана кала','Жаңа қала'],['Otyrar','Отырар'],['Yassy','Яссы','Yassy'],['Bekzat','Бекзат']], landmarks: [['Khoja Ahmed Yasawi Mausoleum','мавзолей Ходжи Ахмеда Ясави','Қожа Ахмет Ясауи'],['Keruen Saray','Керуен Сарай','Karavansaray Turkistan'],['Turkistan Arena'],['New Administrative Center','Новый административный центр']] }),
  Kokshetau: city({ microdistricts: [['Center','Центр'],['Borovskoy','Боровской'],['Vasilkovsky','Васильковский'],['Saryarka','Сарыарка'],['Koktem','Коктем'],['Zhailau','Жайлау'],['Yubileiny','Юбилейный'],['Zastantsionny','Застанционный'],['Old Airport','Старый аэропорт']] }),
  Konaev: city({ microdistricts: [['Center','Центр'],...range(1,5).map((n)=>numberedMicrodistrict(n))], landmarks: [['Kapshagay Reservoir','Капчагайское водохранилище','Қапшағай су қоймасы'],['City Beach','городской пляж'],['Embankment','набережная'],['Gaming Zone','казино','игорная зона']] }),
  Zhanaozen: city({ microdistricts: [['Center','Центр'],['Samal','Самал'],['Shugyla','Шугыла','Шұғыла'],['Arai','Арай'],['Orken','Оркен','Өркен'],['Rakhat','Рахат'],['Zhuldyz','Жулдыз','Жұлдыз'],['Munaily','Мунайлы','Мұнайлы']] }),
  Satbayev: city({ microdistricts: [['Center','Центр']] }),
  Arys: city({ localAreas: [['Center','Центр'],['Railway Station','Вокзал','железнодорожный'],['Ontam','Онтам'],['Syrdarya','Сырдарья'],['Montaitas','Монтайтас']] }),
  Kentau: city({ localAreas: [['Center','Центр'],['Gornyak','Горняк'],['Ashysai','Ащысай'],['Baiyldyr','Байылдыр'],['Khantagi','Хантаги','Қантағы']] }),
  Saryagash: city({ landmarks: [['Saryagash Resort','курорт Сарыагаш','санаторий Сарыагаш'],['Border','граница'],['Zhibek Zholy','Жибек Жолы','Жібек жолы']] }),
  Kosshy: city({ localAreas: [['Lesnaya Polyana','Лесная поляна','Лесная Поляна','Орманды'],['Green Park'],['Taitobe','Тайтобе','Тайтөбе']] }),
});

export const KZ_SEARCH_CLUSTERS = Object.freeze([
  Object.freeze({ name: 'Almaty metropolitan area', type: 'search_cluster', administrative: false, country: 'KZ', city: 'Almaty', members: Object.freeze(['Besagash','Talgar','Kaskelen','Irgeli','Otegen Batyr','Boraldai','Kyrgauyldy','Tuzdybastau','Almalybak','Kemertogan','Guldala','Baiserke','Raiymbek']) }),
  Object.freeze({ name: 'Astana metropolitan area', type: 'search_cluster', administrative: false, country: 'KZ', city: 'Astana', members: Object.freeze(['Kosshy','Lesnaya Polyana','Taitobe','Karaotkel','Ilyinka','Koyandy','Talapker','Karazhar']) }),
]);

export const KZ_AMBIGUOUS_LOCAL_NAMES = Object.freeze([
  'Center','Samal','Dostyk','Aksai','Akzhar','Koktem','Nursat','Arai','Bereke','Vostochny','South-East','Zarechny','Zhuldyz','Shugyla','Saryarka','Nursaya','Almagul',
]);
