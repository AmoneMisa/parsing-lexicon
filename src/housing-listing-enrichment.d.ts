export type HousingAudience = 'women' | 'men' | 'family';
export interface HousingPerPersonPrice { amount: number; currency: string | null; approximate: boolean; scope: 'person' }
export interface HousingCommissionAmount { amount: number; currency: string | null; approximate: boolean }
export interface HousingListingEnrichment {
  rooms?: number | null;
  areaSqm?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  balcony?: boolean | null;
  terrace?: boolean | null;
  privateYard?: boolean | null;
  dishwasher?: boolean | null;
  airConditioner?: boolean | null;
  tv?: boolean | null;
  microwave?: boolean | null;
  oven?: boolean | null;
  bidet?: boolean | null;
  walkInCloset?: boolean | null;
  bathtub?: boolean | null;
  shower?: boolean | null;
  euroLayout?: boolean | null;
  gas?: boolean | null;
  newBuilding?: boolean | null;
  communalSeparated?: boolean | null;
  parking?: boolean | null;
  elevator?: boolean | null;
  heating?: boolean | null;
  hotWater?: boolean | null;
  internet?: boolean | null;
  petsAllowed?: boolean | null;
  childrenAllowed?: boolean | null;
  smokingAllowed?: boolean | null;
  negotiable?: boolean | null;
  furnished?: boolean | null;
  deposit?: boolean | null;
  firstRental?: boolean | null;
  utilitiesAmount?: { amount: number; currency: string | null; approximate?: boolean } | null;
  commission?: boolean | null;
  commissionPercent?: number | null;
  commissionAmount?: HousingCommissionAmount | null;
  audience?: HousingAudience | null;
  audienceAlternatives?: readonly HousingAudience[];
  roomOnly?: boolean;
  studentTarget?: boolean;
  landlordPresent?: boolean;
  priceScope?: 'person' | null;
  perPersonPrice?: HousingPerPersonPrice | null;
  transitRoutes?: readonly string[];
  walkMinutes?: number | null;
  nearby?: readonly string[];
  nearbyEntities?: readonly GeoEntityReference[];
  poiRelations?: readonly HousingPoiRelation[];
  amenities?: readonly string[];
  district?: string | null;
  quarter?: { number: number; suffix: string } | null;
  metro?: string | null;
  residenceComplex?: string | null;
  address?: string | null;
  addressStreet?: string | null;
  addressHouseNumber?: string | null;
  addressBuilding?: string | null;
  geoEntities?: Readonly<Partial<Record<'street' | 'district' | 'metro' | 'mahalla' | 'residentialComplex', Readonly<{
    id: string;
    canonical: string;
    type: string;
    country: string;
    parentId?: string;
  }>>>>;
}

export interface GeoEntityReference { id: string; canonical: string; type: string; country: string; parentId?: string }
export interface HousingPoiRelation {
  relation: 'near' | 'opposite' | 'behind' | 'in_front_of' | 'travel_time';
  target: GeoEntityReference;
  confidence: number;
  distanceMeters?: number;
  durationMinutes?: number;
  mode?: 'walk' | 'drive' | 'unknown';
}
export interface GeoCandidateResolverInput { country: string; city?: string; query: string; types?: readonly string[] }
export type GeoCandidateResolver = (input: Readonly<GeoCandidateResolverInput>) => readonly Readonly<{
  id: string; canonicalName?: string; canonical?: string; type?: string; country?: string; parentId?: string;
}>[] | null | undefined;

export function parseHousingNearby(value: unknown): readonly string[];
export function extractHousingPoiRelations(value: unknown, options?: { country?: string; city?: string; resolveGeoCandidates?: GeoCandidateResolver }): readonly HousingPoiRelation[];
export function parseHousingAudience(value: unknown): Readonly<{ primary: HousingAudience | null; alternatives: readonly HousingAudience[] }>;
export function parseHousingRoomShare(value: unknown): boolean;
export function parseHousingLandlordPresent(value: unknown): boolean;
export function parseHousingStudentTarget(value: unknown): boolean;
export function parseHousingCommission(value: unknown): boolean | null;
export function parseHousingCommissionAmount(value: unknown): HousingCommissionAmount | null;
export function parseHousingPerPersonPrice(value: unknown, options?: { country?: string }): HousingPerPersonPrice | null;
export function parseHousingTransitRoutes(value: unknown): readonly string[];
export function parseHousingObservedAmenities(value: unknown): readonly string[];
export function parseHousingListingEnrichment(
  value: unknown,
  options?: {
    country?: string;
    city?: string;
    dealType?: 'sale' | 'longRent' | 'shortRent' | null;
    resolveGeoEntity?: ((input: Readonly<{ country: string; city?: string; type: string; canonical: string }>) => Readonly<{
      id: string;
      canonicalName?: string;
      canonical?: string;
      type?: string;
      country?: string;
      parentId?: string;
    }> | null | undefined);
    resolveGeoCandidates?: GeoCandidateResolver;
  },
): Readonly<HousingListingEnrichment>;
