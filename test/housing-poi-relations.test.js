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
