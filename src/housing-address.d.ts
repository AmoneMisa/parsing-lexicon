export type HousingAddressParts = Readonly<{
  address: string | null;
  street: string | null;
  houseNumber: string | null;
  building: string | null;
  confidence: number;
  unit?: string;
  level?: string;
  entrance?: string;
  staircase?: string;
  district?: string;
  metro?: string;
  mahalla?: string;
  geoEntities?: Readonly<Partial<Record<'street' | 'district' | 'metro' | 'mahalla' | 'residentialComplex', Readonly<{
    id: string;
    canonical: string;
    type: string;
    country: string;
    parentId?: string;
  }>>>>;
  quarter?: Readonly<{
    number: number;
    suffix: string;
  }>;
}>;

export function parseHousingAddress(
  value: unknown,
  options?: Readonly<{
    allowBare?: boolean;
    allowDelimitedBare?: boolean;
    knownStreet?: string | null;
    knownStreets?: readonly string[];
    country?: string | null;
    city?: string | null;
    resolveGeoEntity?: ((input: Readonly<{ country: string; city?: string; type: string; canonical: string }>) => Readonly<{
      id: string;
      canonicalName?: string;
      canonical?: string;
      type?: string;
      country?: string;
      parentId?: string;
    }> | null | undefined);
  }>,
): HousingAddressParts;

export function resolveHousingAddressGeoEntities(
  parts: HousingAddressParts | null | undefined,
  options: Readonly<{
    country?: string | null;
    city?: string | null;
    resolveGeoEntity?: ((input: Readonly<{ country: string; city?: string; type: string; canonical: string }>) => Readonly<{
      id: string;
      canonicalName?: string;
      canonical?: string;
      type?: string;
      country?: string;
      parentId?: string;
    }> | null | undefined);
  }>,
): Readonly<Partial<Record<'street' | 'district' | 'metro' | 'mahalla' | 'residentialComplex', Readonly<{
  id: string;
  canonical: string;
  type: string;
  country: string;
  parentId?: string;
}>>>>;

export function composeHousingAddress(parts?: Readonly<{
  street?: unknown;
  houseNumber?: unknown;
  building?: unknown;
}>): string | null;
