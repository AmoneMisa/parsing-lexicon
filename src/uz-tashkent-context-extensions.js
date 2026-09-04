import { TASHKENT_AREAS } from './geo.js';
import { aliasesToRegex } from './normalization.js';

function legacyAreaEntry(district, canonical) {
  const source = (TASHKENT_AREAS[district] || []).find((item) => item.name === canonical);
  if (!source) throw new Error(`Missing canonical Tashkent area: ${district}/${canonical}`);

  const aliases = Object.freeze([...new Set([
    source.name,
    ...(source.aliases || []),
  ].filter(Boolean))]);

  return Object.freeze({
    canonical: source.name,
    name: source.name,
    type: source.type || 'local_area',
    entityType: source.type || 'local_area',
    country: 'UZ',
    city: 'Tashkent',
    district,
    parent: district,
    aliases,
    re: aliasesToRegex(aliases),
  });
}

function residentialEntry(canonical, aliases = []) {
  const all = Object.freeze([...new Set([canonical, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical,
    name: canonical,
    type: 'residential_complex',
    entityType: 'residential_complex',
    country: 'UZ',
    city: 'Tashkent',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

// C-1 / Ц-1 is a very common Tashkent housing reference. The historical
// TASHKENT_AREAS catalog already owns its canonical identity (`Buyuk Ipak Yuli`),
// so expose that same entity to the runtime location matcher instead of creating
// a second C-1 canonical or consumer-local regex.
const C1 = legacyAreaEntry('Mirzo Ulugbek', 'Buyuk Ipak Yuli');

export const UZ_TASHKENT_CONTEXT_EXTENSIONS = Object.freeze({
  Tashkent: Object.freeze({
    localAreas: Object.freeze([C1]),
    residentialComplexes: Object.freeze([
      residentialEntry('Eco Dream', [
        'ЖК Eco Dream', 'Eco Dream TJM', 'Eco Dream turar joy majmuasi', 'Eco Dream turar-joy majmuasi',
        'Эко Дрим', 'ЖК Эко Дрим',
      ]),
      residentialEntry('Bobur Residence', [
        'ЖК Bobur Residence', 'Bobur Residence TJM', 'Bobur Residence turar joy majmuasi', 'Bobur Residence turar-joy majmuasi',
        'Бобур Резиденс', 'ЖК Бобур Резиденс',
      ]),
      residentialEntry('Riverside', [
        'ЖК Riverside', 'Riverside TJM', 'Riverside turar joy majmuasi', 'Riverside turar-joy majmuasi',
        'Риверсайд', 'ЖК Риверсайд',
      ]),
      residentialEntry('Minor River', [
        'ЖК Minor River', 'Minor River TJM', 'Minor River turar joy majmuasi', 'Minor River turar-joy majmuasi',
        'Минор Ривер', 'ЖК Минор Ривер',
      ]),
      residentialEntry('Obi Hayot', [
        'OBI Hayot', 'Obi hayot', 'ЖК OBI Hayot', 'ЖК Obi Hayot', 'OBI Hayot TJM', 'OBI Hayot turar joy majmuasi',
        'Оби Хаёт', 'ОБИ Хаёт', 'ЖК Оби Хаёт',
      ]),
      residentialEntry('Askiya City', [
        'Askiya city', 'ЖК Askiya City', 'Askiya City TJM', 'Askiya City turar joy majmuasi',
        'Аския Сити', 'ЖК Аския Сити',
      ]),
      residentialEntry('Wiston', [
        'ЖК Wiston', 'Wiston TJM', 'Wiston turar joy majmuasi', 'Wiston turar-joy majmuasi',
        'Вистон', 'ЖК Вистон',
      ]),
      residentialEntry('Zaytunli', [
        'ЖК Zaytunli', 'Zaytunli TJM', 'Zaytunli turar joy majmuasi', 'Zaytunli turar-joy majmuasi',
        'Зайтунли', 'ЖК Зайтунли',
      ]),
      residentialEntry('Aristocrat Home', [
        'ЖК Aristocrat Home', 'Aristocrat Home TJM', 'Aristocrat Home turar joy majmuasi', 'Aristocrat Home yashash majmuasi',
        'Аристократ Хоум', 'ЖК Аристократ Хоум',
      ]),
      residentialEntry('Shoxsaroy Residence', [
        'Shohsaroy Residence', 'Shokhsaroy Residence', 'ЖК Shoxsaroy Residence', 'Shoxsaroy Residence TJM', 'Shoxsaroy Residence turar joy majmuasi',
        'Шохсарой Резиденс', 'Шохсарой Резиденс ЖК',
      ]),
      residentialEntry('Yakkasaroy Palace', [
        'Yakkasaray Palace', 'ЖК Yakkasaroy Palace', 'Yakkasaroy Palace TJM', 'Yakkasaroy Palace turar joy majmuasi',
        'Яккасарой Палас', 'Яккасарай Палас', 'ЖК Яккасарой Палас',
      ]),
      residentialEntry('Olmos Residence', [
        'ЖК Olmos Residence', 'Olmos Residence TJM', 'Olmos Residence turar joy majmuasi',
        'Олмос Резиденс', 'ЖК Олмос Резиденс',
      ]),
      residentialEntry('Yangi Shahar', [
        'ЖК Yangi Shahar', 'Yangi Shahar TJM', 'Yangi Shahar turar joy majmuasi', 'Yangi Shahar turar-joy majmuasi',
        'Янги Шахар', 'ЖК Янги Шахар',
      ]),
      residentialEntry('Yashnabod', [
        'Yashnobod', 'ЖК Yashnabod', 'ЖК Yashnobod', 'Yashnabod TJM', 'Yashnobod turar joy majmuasi',
        'Яшнабад', 'Яшнобод', 'ЖК Яшнабад', 'ЖК Яшнобод',
      ]),
      residentialEntry('Turkiston', [
        'Turkiston Avenue', 'TJM Turkiston', 'ЖК Turkiston', 'Turkiston TJM', 'Turkiston turar joy majmuasi',
        'Туркистон', 'ЖК Туркистон', 'Туркистон Авеню',
      ]),
    ]),
  }),
});
