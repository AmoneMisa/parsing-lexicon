import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHousingListingEnrichment } from '../src/housing-listing-enrichment.js';
import { extractHousingPoiRelations } from '../src/housing-poi-relations.js';

const resolver = ({ query, types = [] }) => {
  const known = {
    'Tashkent State University': { id: 'uz:tashkent:poi:tsu', canonicalName: 'Tashkent State University', type: 'poi.university', country: 'UZ', parentId: 'uz:tashkent' },
    'Olmos': { id: 'uz:tashkent:metro:olmos', canonicalName: 'Olmos', type: 'metro', country: 'UZ', parentId: 'uz:tashkent' },
  };
  const entity = known[query];
  return entity && (!types.length || types.includes(entity.type)) ? [entity] : [];
};

test('resolves a nearby institution to a stable catalog reference without coordinates', () => {
  const result = parseHousingListingEnrichment('Apartment near Tashkent State University.', { country: 'UZ', city: 'Tashkent', resolveGeoCandidates: resolver });
  assert.equal(result.poiRelations?.[0]?.relation, 'near');
  assert.equal(result.poiRelations?.[0]?.target.id, 'uz:tashkent:poi:tsu');
  assert.equal('coordinates' in result.poiRelations?.[0]?.target, false);
  assert.equal(result.nearbyEntities?.[0]?.canonical, 'Tashkent State University');
});

test('keeps distance and walking mode outside the resolved POI name', () => {
  const [result] = extractHousingPoiRelations('500 m from Tashkent State University', { country: 'UZ', city: 'Tashkent', resolveGeoCandidates: resolver });
  assert.equal(result.target.canonical, 'Tashkent State University');
  assert.equal(result.distanceMeters, 500);
  assert.equal(result.target.canonical.includes('500'), false);
});

test('uses metro marker to disambiguate an otherwise ambiguous name', () => {
  const [result] = extractHousingPoiRelations('10 minutes to Olmos metro', { country: 'UZ', city: 'Tashkent', resolveGeoCandidates: resolver });
  assert.equal(result.target.type, 'metro');
  assert.equal(result.durationMinutes, 10);
});

test('target-first Ukrainian travel time separates a concrete supermarket name from its duration', () => {
  const result = extractHousingPoiRelations('Супермаркет Класс 5 хвилин, метро Героев праци', {
    country: 'UA', city: 'Kharkiv',
    resolveGeoCandidates({ query }) {
      return query.toLowerCase() === 'класс'
        ? [{ id: 'ua:kharkiv:supermarket:klass', canonical: 'Klass', type: 'supermarket', country: 'UA', parentId: 'ua:kharkiv:city:kharkiv' }]
        : [];
    },
  });
  assert.deepEqual(result, [{
    relation: 'travel_time',
    target: { id: 'ua:kharkiv:supermarket:klass', canonical: 'Klass', type: 'supermarket', country: 'UA', parentId: 'ua:kharkiv:city:kharkiv' },
    confidence: 0.94,
    durationMinutes: 5,
    mode: 'unknown',
  }]);
});

test('recognises priority-country proximity wording without putting it into the POI name', () => {
  const entities = {
    'Алатау метро': { id: 'kz:almaty:metro:alataw', canonical: 'Alatau', type: 'metro', country: 'KZ', parentId: 'kz:almaty:city:almaty' },
    'Universitatea București': { id: 'ro:bucuresti:university:ub', canonical: 'University of Bucharest', type: 'poi.university', country: 'RO', parentId: 'ro:bucuresti:city:bucuresti' },
  };
  const resolver = ({ query }) => entities[query] ? [entities[query]] : [];

  const [kazakh] = extractHousingPoiRelations('Алатау метро жанында', { country: 'KZ', city: 'Almaty', resolveGeoCandidates: resolver });
  assert.equal(kazakh.relation, 'near');
  assert.equal(kazakh.target.canonical, 'Alatau');

  const [kazakhOpposite] = extractHousingPoiRelations('Алатау метро қарсысында', { country: 'KZ', city: 'Almaty', resolveGeoCandidates: resolver });
  assert.equal(kazakhOpposite.relation, 'opposite');

  const [romanian] = extractHousingPoiRelations('în spatele Universitatea București', { country: 'RO', city: 'Bucharest', resolveGeoCandidates: resolver });
  assert.equal(romanian.relation, 'behind');
  assert.equal(romanian.target.canonical, 'University of Bucharest');

  const wrongCity = extractHousingPoiRelations('lângă Universitatea București', {
    country: 'RO', city: 'Bucharest',
    resolveGeoCandidates: () => [{ id: 'ro:cluj:university:ub', canonical: 'University of Bucharest', type: 'poi.university', country: 'RO', parentId: 'ro:cluj:city:cluj' }],
  });
  assert.deepEqual(wrongCity, []);
});

test('uses multilingual transport and parking markers to constrain catalog resolution', () => {
  const entities = {
    'аеропорт Львів': { id: 'ua:lviv:poi:airport', canonical: 'Lviv Danylo Halytskyi International Airport', type: 'poi.airport', country: 'UA', parentId: 'ua:lviv' },
    'Автостанція Південна': { id: 'ua:lviv:poi:south-bus-station', canonical: 'Lviv South Bus Station', type: 'poi.bus_station', country: 'UA', parentId: 'ua:lviv' },
    'avtoturargoh Makro': { id: 'uz:tashkent:poi:makro-parking', canonical: 'Makro Parking', type: 'poi.parking', country: 'UZ', parentId: 'uz:tashkent' },
  };
  const typedResolver = ({ query, types = [] }) => {
    const entity = entities[query];
    return entity && types.includes(entity.type) ? [entity] : [];
  };

  assert.equal(extractHousingPoiRelations('біля аеропорт Львів', { country: 'UA', city: 'Lviv', resolveGeoCandidates: typedResolver })[0]?.target.type, 'poi.airport');
  assert.equal(extractHousingPoiRelations('біля Автостанція Південна', { country: 'UA', city: 'Lviv', resolveGeoCandidates: typedResolver })[0]?.target.type, 'poi.bus_station');
  assert.equal(extractHousingPoiRelations('avtoturargoh Makro yaqinida', { country: 'UZ', city: 'Tashkent', resolveGeoCandidates: typedResolver })[0]?.target.type, 'poi.parking');
});
