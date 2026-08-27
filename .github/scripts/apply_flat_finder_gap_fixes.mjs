import { readFileSync, writeFileSync } from 'node:fs';

function patch(path, from, to) {
  const source = readFileSync(path, 'utf8');
  if (!source.includes(from)) throw new Error(`Missing patch anchor in ${path}: ${from.slice(0, 80)}`);
  writeFileSync(path, source.replace(from, to));
}

patch(
  'src/housing-listing-fields.js',
  '/кондицион|сплит[- ]?систем|konditsioner|klimat|air\\s*con|aer\\s+condi[țt]ionat/iu',
  '/кондицион|сплит[- ]?систем|konditsioner|kansaner|klimat|air\\s*con|aer\\s+condi[țt]ionat/iu',
);
patch(
  'src/housing-listing-fields.js',
  '/новостро|новобуд|новый\\s+дом|new\\s*build|newly\\s*built|yangi\\s+(?:bino|qurilgan|uy)|bloc\\s+nou/iu',
  '/новостро|новобуд|новый\\s+дом|novast(?:royka|iroyka)|navast(?:royka|iroyka)|new\\s*build|newly\\s*built|yangi\\s+(?:bino|qurilgan|uy)|bloc\\s+nou/iu',
);
patch(
  'src/housing-listing-fields.js',
  '|kommunal\\p{L}*\\s*(?:kiritilgan|ichida)|utilities?\\s*included',
  '|kommunal\\p{L}*\\s*(?:kiritilgan|ichida)|комунал(?:каси)?\\s+ичида|коммунал(?:каси)?\\s+ичида|utilities?\\s*included',
);

patch(
  'src/ua-secondary-cities.js',
  "Izmail: city({ microdistricts: [['Tsentr','Центр'],['Krepost','Крепость'],['Kopana Balka','Копана Балка'],['Broska','Броска']]",
  "Izmail: city({ microdistricts: [['Tsentr','Центр'],['BAM','БАМ','Бам'],['Krepost','Крепость'],['Kopana Balka','Копана Балка'],['Broska','Броска']]",
);

patch(
  'src/tashkent-colloquial.js',
  "  'Mirzo Ulugbek': Object.freeze([\n    area('Feruza-1'",
  "  'Mirzo Ulugbek': Object.freeze([\n    area('Alayskiy C-2', ['алайский ц 2', 'алайский ц-2', 'alayskiy c 2', 'alayskiy c-2']),\n    area('Feruza-1'",
);
patch(
  'src/tashkent-colloquial.js',
  "  Shaykhantahur: Object.freeze([\n    area('Gulabad'",
  "  Shaykhantahur: Object.freeze([\n    area('Labzak C-13', ['лабзак ц 13', 'лабзак ц-13', 'labzak c 13', 'labzak c-13']),\n    area('Gulabad'",
);
patch(
  'src/tashkent-colloquial.js',
  "  Yunusabad: Object.freeze([\n    area('Katta Hasanboy'",
  "  Yunusabad: Object.freeze([\n    area('Kashgar C-4', ['кашгар ц 4', 'кашгар ц-4', 'kashgar c 4', 'kashgar c-4']),\n    area('Katta Hasanboy'",
);
patch(
  'src/tashkent-colloquial.js',
  "  Yakkasaray: Object.freeze([\n    area('Bobur'",
  "  Yakkasaray: Object.freeze([\n    area('Glinka', ['глинка', 'glinka']),\n    area('Bobur'",
);
patch(
  'src/tashkent-colloquial.js',
  "  Yashnobod: Object.freeze([\n    area('Asalabad-1'",
  "  Yangihayot: Object.freeze([\n    area('Yangi Choshtepa', ['янги чоштепа', 'yangi choshtepa']),\n  ]),\n  Yashnobod: Object.freeze([\n    area('Aviasozlar-3', ['авиасозлар 3', 'авиасозлар-3', 'aviasozlar 3', 'aviasozlar-3']),\n    area('Asalabad-1'",
);
