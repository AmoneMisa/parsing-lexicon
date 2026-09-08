export type { GeoCandidateResolver, GeoCandidateResolverInput, GeoEntityReference, HousingPoiRelation } from './housing-listing-enrichment.js';
export function extractHousingPoiRelations(
  value: unknown,
  options?: { country?: string; city?: string; resolveGeoCandidates?: import('./housing-listing-enrichment.js').GeoCandidateResolver },
): readonly import('./housing-listing-enrichment.js').HousingPoiRelation[];
