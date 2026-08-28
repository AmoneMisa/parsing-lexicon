export type HousingAddressParts = Readonly<{
  address: string | null;
  street: string | null;
  houseNumber: string | null;
  building: string | null;
  confidence: number;
  district?: string;
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
  }>,
): HousingAddressParts;

export function composeHousingAddress(parts?: Readonly<{
  street?: unknown;
  houseNumber?: unknown;
  building?: unknown;
}>): string | null;
