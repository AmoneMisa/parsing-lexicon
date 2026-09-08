import test from 'node:test';
import assert from 'node:assert/strict';
import { composeHousingAddress, parseHousingAddress } from '../src/housing-address.js';

test('parses explicit Ukrainian street, house and building', () => {
  assert.deepEqual(parseHousingAddress('вул. Воробкевича 12, корпус 2'), {
    address: 'Воробкевича 12 корп. 2',
    street: 'Воробкевича',
    houseNumber: '12',
    building: '2',
    confidence: 1,
  });
});

test('parses Ukrainian postfix street type and ignores preceding listing prose', () => {
  const parsed = parseHousingAddress('продаж квартири жк Alter ego 63m2 2к Лабораторний провулок 7');
  assert.equal(parsed.street, 'Лабораторний провулок');
  assert.equal(parsed.houseNumber, '7');
  assert.equal(parsed.address, 'Лабораторний провулок 7');
  assert.equal(parsed.confidence, 1);

  const fromDescription = parseHousingAddress('Продаж видової квартири в ЖК Alter Ego | Лабораторний провулок, 7\nУ продажу стильна квартира');
  assert.equal(fromDescription.street, 'Лабораторний провулок');
  assert.equal(fromDescription.houseNumber, '7');
  assert.equal(fromDescription.address, 'Лабораторний провулок 7');
});

test('parses abbreviated Ukrainian avenue before trailing ЖК context', () => {
  const parsed = parseHousingAddress(
    'Продам 1 кімн. квартиру на пр. Олександрівський, 69Д, ЖК Олександрівський, від забудовника Авантаж.',
  );
  assert.equal(parsed.street, 'Олександрівський');
  assert.equal(parsed.houseNumber, '69Д');
  assert.equal(parsed.address, 'Олександрівський 69Д');
  assert.equal(parsed.confidence, 1);
});

test('stops prefixed street address before following listing prose', () => {
  const parsed = parseHousingAddress('Сдам 1 комнатную квартиру улица львовская 1 /2х этажного дома ( дом переделан под квартиры, двор общий для квартирантов )');
  assert.equal(parsed.street, 'львовская');
  assert.equal(parsed.houseNumber, '1');
  assert.equal(parsed.address, 'львовская 1');
  assert.equal(parsed.confidence, 1);
});

test('parses labelled bare address without treating arbitrary prose as address', () => {
  const parsed = parseHousingAddress('Адрес: Воробкевича 12-А');
  assert.equal(parsed.street, 'Воробкевича');
  assert.equal(parsed.houseNumber, '12-А');
  assert.equal(parsed.address, 'Воробкевича 12-А');

  assert.deepEqual(parseHousingAddress('Цена 95000, телефон +998 90 123 45 67'), {
    address: null,
    street: null,
    houseNumber: null,
    building: null,
    confidence: 0,
  });
});

test('does not turn a labelled district and landmark sentence into a street', () => {
  const parsed = parseHousingAddress('Manzil: Yakkasaroy, Seul Moon, Magic City Yonida, Narxozga Yaqin');
  assert.equal(parsed.address, null);
  assert.equal(parsed.street, null);
  assert.equal(parsed.houseNumber, null);
  assert.equal(parsed.district, 'Yakkasaray');
});

test('source address guard rejects floors districts stops and residential complexes', () => {
  for (const value of [
    'Перший поверх',
    'Район Цукровий',
    'Біля зупинки',
    'ЖК Олександрівський',
  ]) {
    assert.deepEqual(parseHousingAddress(value, { allowBare: true }), {
      address: null,
      street: null,
      houseNumber: null,
      building: null,
      confidence: 0,
    }, value);
  }
});

test('parses Uzbek and Romanian explicit address markers', () => {
  const uz = parseHousingAddress("Shota Rustaveli ko'chasi 58");
  assert.equal(uz.street, 'Shota Rustaveli');
  assert.equal(uz.houseNumber, '58');

  const ro = parseHousingAddress('Strada Lujerului 42, bloc 3');
  assert.equal(ro.street, 'Lujerului');
  assert.equal(ro.houseNumber, '42');
  assert.equal(ro.building, '3');
});

test('normalizes the common Kharkiv Poltavskyi Shliakh OCR typo before parsing its house number', () => {
  assert.deepEqual(parseHousingAddress('улица Полтавский шоях 171'), {
    address: 'Полтавский шлях 171',
    street: 'Полтавский шлях',
    houseNumber: '171',
    building: null,
    confidence: 1,
  });
});

test('parses a Tashkent mavze address into district, quarter, house and floor fields', () => {
  assert.deepEqual(
    parseHousingAddress('Chilonzor 10 mavze 11 a dom 9 etashka 4 etajda 2 honali'),
    {
      address: null,
      street: null,
      houseNumber: '11A',
      building: null,
      confidence: 1,
      district: 'Chilanzar',
      quarter: { number: 10, suffix: '' },
      level: '4',
    },
  );
});

test('keeps Tashkent district, metro, mahalla and compact house components separate', () => {
  const parsed = parseHousingAddress('Yashnobot tuman Olmos metrosi Olmos mahalla 3/11/16');
  assert.equal(parsed.street, null);
  assert.equal(parsed.district, 'Yashnobod');
  assert.equal(parsed.metro, 'Olmos');
  assert.equal(parsed.mahalla, 'Olmos');
  assert.equal(parsed.houseNumber, '3/11/16');
});

test('returns stable geo-catalog references through an injected, city-scoped resolver', () => {
  const calls = [];
  const parsed = parseHousingAddress('Yashnobot tuman Olmos metrosi Olmos mahalla 3/11/16', {
    country: 'UZ',
    city: 'Tashkent',
    resolveGeoEntity(input) {
      calls.push(input);
      const ids = {
        'district:Yashnobod': 'uz:tashkent:district:yashnobod',
        'metro:Olmos': 'uz:tashkent:metro:olmos',
      };
      const id = ids[`${input.type}:${input.canonical}`];
      return id ? { id, canonicalName: input.canonical, type: input.type, country: input.country, parentId: 'uz:tashkent:city:tashkent' } : null;
    },
  });

  assert.deepEqual(parsed.geoEntities, {
    district: {
      id: 'uz:tashkent:district:yashnobod', canonical: 'Yashnobod', type: 'district', country: 'UZ', parentId: 'uz:tashkent:city:tashkent',
    },
    metro: {
      id: 'uz:tashkent:metro:olmos', canonical: 'Olmos', type: 'metro', country: 'UZ', parentId: 'uz:tashkent:city:tashkent',
    },
  });
  assert.ok(calls.every((call) => call.country === 'UZ' && call.city === 'Tashkent'));
  assert.equal('coordinates' in parsed.geoEntities.metro, false);
});

test('does not attach an out-of-scope geo-catalog entity from a resolver', () => {
  const parsed = parseHousingAddress('Olmos metrosi', {
    country: 'UZ',
    city: 'Tashkent',
    resolveGeoEntity() {
      return {
        id: 'kz:almaty:metro:olmos',
        canonicalName: 'Olmos',
        type: 'metro',
        country: 'KZ',
        parentId: 'kz:almaty:city:almaty',
      };
    },
  });

  assert.equal(parsed.metro, 'Olmos');
  assert.equal(parsed.geoEntities, undefined);
});

test('known canonical street extracts only an adjacent house number from prose', () => {
  const ua = parseHousingAddress('Світла квартира, Воробкевича 12, поруч парк', { knownStreet: 'Воробкевича' });
  assert.equal(ua.street, 'Воробкевича');
  assert.equal(ua.houseNumber, '12');
  assert.equal(ua.address, 'Воробкевича 12');

  const uz = parseHousingAddress("Toshkent, Shota Rustaveli ko'chasi 58, 3 xona", { knownStreet: 'Shota Rustaveli' });
  assert.equal(uz.street, 'Shota Rustaveli');
  assert.equal(uz.houseNumber, '58');

  const noAdjacentNumber = parseHousingAddress('Воробкевича, площа 68 м2, ціна 95000', { knownStreet: 'Воробкевича' });
  assert.equal(noAdjacentNumber.street, 'Воробкевича');
  assert.equal(noAdjacentNumber.houseNumber, null);
});

test('prefers the longest supplied canonical street candidate', () => {
  const parsed = parseHousingAddress('ул. Алишера Навои 17', {
    knownStreets: ['Навои', 'Алишера Навои'],
  });
  assert.equal(parsed.street, 'Алишера Навои');
  assert.equal(parsed.houseNumber, '17');
  assert.equal(parsed.address, 'Алишера Навои 17');
  assert.equal(parsed.confidence, 0.98);
});

test('allowBare is reserved for source-provided address fields', () => {
  const parsed = parseHousingAddress('Воробкевича 12', { allowBare: true });
  assert.equal(parsed.street, 'Воробкевича');
  assert.equal(parsed.houseNumber, '12');
  assert.equal(parsed.confidence, 0.85);
});

test('allowDelimitedBare extracts street and house from city-scoped comma prose', () => {
  const parsed = parseHousingAddress(
    'Харьков, Киевский р-н, Метростроителей, 3, Северная Салтовка',
    { allowDelimitedBare: true },
  );
  assert.equal(parsed.street, 'Метростроителей');
  assert.equal(parsed.houseNumber, '3');
  assert.equal(parsed.address, 'Метростроителей 3');
});

test('address confidence uses contextual negative evidence for weak delimited prose', () => {
  const clean = parseHousingAddress('Метростроителей, 3', { allowDelimitedBare: true });
  const noisy = parseHousingAddress('Метростроителей, 3, телефон +998 90 123 45 67, цена 900$', { allowDelimitedBare: true });
  assert.ok(clean.confidence > 0.7);
  assert.equal(noisy.street, 'Метростроителей');
  assert.ok(noisy.confidence < clean.confidence);
});

test('extracts secondary address components without changing canonical building address', () => {
  const parsed = parseHousingAddress('ул. Мукими 17, корп. 2, кв. 34, 5 этаж, подъезд 3');
  assert.equal(parsed.street, 'Мукими');
  assert.equal(parsed.houseNumber, '17');
  assert.equal(parsed.building, '2');
  assert.equal(parsed.address, 'Мукими 17 корп. 2');
  assert.equal(parsed.unit, '34');
  assert.equal(parsed.level, '5');
  assert.equal(parsed.entrance, '3');
  assert.equal(parsed.confidence, 1);

  const ro = parseHousingAddress('Strada Lujerului 42, bloc 3, ap. 18, scara B, etaj 4');
  assert.equal(ro.street, 'Lujerului');
  assert.equal(ro.houseNumber, '42');
  assert.equal(ro.building, '3');
  assert.equal(ro.unit, '18');
  assert.equal(ro.staircase, 'B');
  assert.equal(ro.level, '4');
});

test('parses compact and Uzbek building notation without collapsing components', () => {
  const compact = parseHousingAddress('ул. Мукими 17к2');
  assert.equal(compact.street, 'Мукими');
  assert.equal(compact.houseNumber, '17');
  assert.equal(compact.building, '2');

  const uzbek = parseHousingAddress('Shota Rustaveli ko\'chasi 17 bino 2');
  assert.equal(uzbek.street, 'Shota Rustaveli');
  assert.equal(uzbek.houseNumber, '17');
  assert.equal(uzbek.building, '2');

  const multipart = parseHousingAddress('Yashnobot tuman Olmos mahalla 3/11/16');
  assert.equal(multipart.houseNumber, '3/11/16');
});

test('does not expose secondary components without a valid address', () => {
  assert.deepEqual(parseHousingAddress('кв. 34, 5 этаж, подъезд 3'), {
    address: null,
    street: null,
    houseNumber: null,
    building: null,
    confidence: 0,
  });

  assert.deepEqual(parseHousingAddress('Сдам квартиру 2 комнаты, 5 этаж'), {
    address: null,
    street: null,
    houseNumber: null,
    building: null,
    confidence: 0,
  });
});

test('composeHousingAddress produces a stable canonical query string', () => {
  assert.equal(composeHousingAddress({ street: 'Воробкевича', houseNumber: '12', building: '2' }), 'Воробкевича 12 корп. 2');
});
