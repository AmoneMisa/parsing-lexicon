import { normalizeForMatch } from './normalization.js';
import { canonicalUkraineCity } from './ukraine.js';
import { locationCities } from './locations.js';

// Coordinate contract intentionally mirrors Flat Finder's existing Uzbekistan
// geocoding pipeline: { lat, lng }, exact anchors first, city centre fallback.
//
// City centres are canonical package keys. Historical/local spellings resolve
// through canonicalUkraineCity(), so renamed cities do not create duplicate
// coordinate records.
const point = (lat, lng) => Object.freeze({ lat, lng });

export const UA_CITY_COORDINATES = Object.freeze({
  Kyiv: point(50.4500, 30.5236),
  Kharkiv: point(49.9925, 36.2311),
  Odesa: point(46.4775, 30.7326),
  Dnipro: point(48.4675, 35.0400),
  Lviv: point(49.8425, 24.0322),
  Zaporizhzhia: point(47.8500, 35.1175),
  Vinnytsia: point(49.2372, 28.4672),
  'Ivano-Frankivsk': point(48.9228, 24.7106),
  Chernivtsi: point(48.2908, 25.9344),
  Uzhhorod: point(48.6239, 22.2950),
  Mukachevo: point(48.4414, 22.7136),
  Lutsk: point(50.7478, 25.3244),
  Rivne: point(50.6197, 26.2514),
  Ternopil: point(49.5667, 25.6000),
  Khmelnytskyi: point(49.4200, 27.0000),
  Zhytomyr: point(50.2544, 28.6578),
  Cherkasy: point(49.4444, 32.0597),
  Poltava: point(49.5894, 34.5514),
  Chernihiv: point(51.4939, 31.2947),
  Sumy: point(50.9067, 34.7992),
  Mykolaiv: point(46.9750, 31.9950),
  Kherson: point(46.6425, 32.6250),
  Kropyvnytskyi: point(48.5103, 32.2667),
  Irpin: point(50.5167, 30.2500),
  Brovary: point(50.5111, 30.7900),
  'Bila Tserkva': point(49.7956, 30.1167),
  'Kryvyi Rih': point(47.9100, 33.3900),
  Kremenchuk: point(49.0631, 33.4039),
  Uman: point(48.7500, 30.2167),
  Kamianske: point(48.5167, 34.6133),
  Nikopol: point(47.5667, 34.4000),
  Pavlohrad: point(48.5200, 35.8700),
  'Kamianets-Podilskyi': point(48.6806, 26.5806),
  Drohobych: point(49.3500, 23.5000),
  Stryi: point(49.2500, 23.8500),
  Kolomyia: point(48.5167, 25.0333),
  Kalush: point(49.0442, 24.3597),
  Fastiv: point(50.0747, 29.9181),
  Vasylkiv: point(50.1775, 30.3217),
  Boyarka: point(50.3292, 30.2886),
  Pereiaslav: point(50.0650, 31.4450),
  Chuhuiv: point(49.8372, 36.6899),
  Lozova: point(48.8892, 36.3161),
  Izium: point(49.1958, 37.2803),
  Kupiansk: point(49.7114, 37.6139),
  Merefa: point(49.8197, 36.0686),
  Liubotyn: point(49.9489, 35.9306),
  Chornomorsk: point(46.3013, 30.6545),
  'Bilhorod-Dnistrovskyi': point(46.1939, 30.3411),
  Podilsk: point(47.7531, 29.5309),
  Sambir: point(49.5167, 23.2000),
  Truskavets: point(49.2806, 23.5050),
  Boryslav: point(49.2881, 23.4267),
  Sheptytskyi: point(50.3822, 24.2275),
  Kovel: point(51.2167, 24.7167),
  Dubno: point(50.3931, 25.7350),
  Berdychiv: point(49.8919, 28.6000),
  Korosten: point(50.9500, 28.6500),
  Zviahel: point(50.5833, 27.6333),
  Zhmerynka: point(49.0425, 28.0992),
  'Mohyliv-Podilskyi': point(48.4500, 27.7833),
  Khmilnyk: point(49.5500, 27.9667),
  Smila: point(49.2167, 31.8667),
  Myrhorod: point(49.9640, 33.6124),
  Konotop: point(51.2375, 33.2083),
  Shostka: point(51.8657, 33.4766),
  Hlukhiv: point(51.6765, 33.9078),
  Nizhyn: point(51.0474, 31.8805),
  Pervomaisk: point(48.0500, 30.8500),
  Voznesensk: point(47.5725, 31.3119),
  Yuzhnoukrainsk: point(47.8217, 31.1750),
  Melitopol: point(46.8489, 35.3675),
  Berdiansk: point(46.7556, 36.7889),
  Mariupol: point(47.1306, 37.5639),
  Kramatorsk: point(48.7392, 37.5839),
  Sloviansk: point(48.8533, 37.6059),
  Bakhmut: point(48.5947, 38.0008),
  Pokrovsk: point(48.2833, 37.1833),
  Kostiantynivka: point(48.5333, 37.7167),
  Toretsk: point(48.4000, 37.8333),
  Avdiivka: point(48.1333, 37.7500),
  Luhansk: point(48.5717, 39.2973),
  Sievierodonetsk: point(48.9481, 38.4933),
  Lysychansk: point(48.9169, 38.4306),
  Alchevsk: point(48.4672, 38.7983),
  Rubizhne: point(49.0336, 38.3722),
  Vynohradiv: point(48.1397, 23.0331),
});

// Exact dependency anchors are intentionally sparse. A district or neighbourhood
// is not a point; only add an entry here when a stable, unambiguous anchor has
// been verified. Everything else goes through geocoding candidates and then the
// city-centre fallback, matching the Uzbekistan pipeline rather than inventing
// centroids.
export const UA_LOCATION_COORDINATES = Object.freeze({
  Odesa: Object.freeze({
    suburbs: Object.freeze({
      'Крижанівка': point(46.5617, 30.7961),
    }),
  }),
});

const TYPE_TO_LIST = Object.freeze({
  district: 'districts',
  districts: 'districts',
  microdistrict: 'microdistricts',
  microdistricts: 'microdistricts',
  mahalla: 'mahallas',
  mahallas: 'mahallas',
  localArea: 'localAreas',
  local_area: 'localAreas',
  localAreas: 'localAreas',
  suburb: 'suburbs',
  suburbs: 'suburbs',
  settlement: 'settlements',
  settlements: 'settlements',
  metro: 'metro',
  residentialComplex: 'residentialComplexes',
  residential_complex: 'residentialComplexes',
  residentialComplexes: 'residentialComplexes',
  street: 'streets',
  streets: 'streets',
  landmark: 'landmarks',
  landmarks: 'landmarks',
  poi: 'pois',
  pois: 'pois',
});

function canonicalCity(value) {
  return canonicalUkraineCity(value) || null;
}

function listKey(type) {
  return TYPE_TO_LIST[type] || String(type || '');
}

function findLocationEntry(city, type, value) {
  const key = listKey(type);
  const data = locationCities('UA')[city];
  const normalized = normalizeForMatch(value);
  if (!data || !key || !normalized) return null;
  return (data[key] || []).find((entry) =>
    [entry?.canonical, entry?.name, ...(entry?.aliases || [])]
      .some((candidate) => normalizeForMatch(candidate) === normalized)) || null;
}

export function ukraineCityCoordinates(value) {
  const city = canonicalCity(value);
  return city ? (UA_CITY_COORDINATES[city] || null) : null;
}

export function ukraineLocationCoordinates(cityValue, type, locationValue) {
  const city = canonicalCity(cityValue);
  if (!city) return null;
  const entry = findLocationEntry(city, type, locationValue);
  const name = entry?.canonical || entry?.name || String(locationValue || '');
  if (!name) return null;
  return UA_LOCATION_COORDINATES[city]?.[listKey(type)]?.[name] || null;
}

export function ukraineLocationGeocodeCandidates(cityValue, type, locationValue) {
  const city = canonicalCity(cityValue);
  if (!city) return Object.freeze([]);
  const entry = findLocationEntry(city, type, locationValue);
  const names = [...new Set([
    entry?.canonical,
    entry?.name,
    String(locationValue || '').trim(),
  ].filter(Boolean))];
  return Object.freeze(names.map((name) => `${name}, ${city}, Ukraine`));
}

export function ukraineCoordinateFallback(cityValue, type = null, locationValue = null) {
  const city = canonicalCity(cityValue);
  if (!city) return null;
  if (type && locationValue) {
    const exact = ukraineLocationCoordinates(city, type, locationValue);
    if (exact) return Object.freeze({ ...exact, accuracy: 'exact', source: 'location' });
  }
  const center = UA_CITY_COORDINATES[city];
  return center ? Object.freeze({ ...center, accuracy: 'city', source: 'city' }) : null;
}
