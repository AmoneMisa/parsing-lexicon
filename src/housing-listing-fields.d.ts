export type HousingMinRentTerm = Readonly<{
  value: number;
  unit: 'day' | 'week' | 'month' | 'year';
}>;

export type HousingUtilitiesAmount = Readonly<{
  amount: number;
  currency: string | null;
  approximate: boolean;
}>;

export type HousingListingFields = Readonly<{
  bedrooms: number | null;
  bathrooms: number | null;
  buildingYear: number | null;
  balcony: boolean | null;
  terrace: boolean | null;
  privateYard: boolean | null;
  courtyard: boolean | null;
  gazebo: boolean | null;
  dishwasher: boolean | null;
  airConditioner: boolean | null;
  tv: boolean | null;
  microwave: boolean | null;
  oven: boolean | null;
  bidet: boolean | null;
  walkInCloset: boolean | null;
  bathtub: boolean | null;
  shower: boolean | null;
  euroLayout: boolean | null;
  gas: boolean | null;
  newBuilding: boolean | null;
  communalSeparated: boolean | null;
  parking: boolean | null;
  elevator: boolean | null;
  heating: boolean | null;
  hotWater: boolean | null;
  internet: boolean | null;
  petsAllowed: boolean | null;
  childrenAllowed: boolean | null;
  smokingAllowed: boolean | null;
  negotiable: boolean | null;
  furnished: boolean | null;
  depositRequired: boolean | null;
  firstRent: boolean | null;
  minRentTerm: HousingMinRentTerm | null;
  availableFrom: string | null;
  utilitiesAmount: HousingUtilitiesAmount | null;
}>;

/**
 * Empty input yields an empty object, so every field is optional on the result.
 */
export function parseHousingListingFields(
  value: unknown,
  options?: { country?: string },
): Readonly<Partial<HousingListingFields>>;
