export type HousingAreaDetails = Readonly<{
  total: number | null;
  living: number | null;
  kitchen: number | null;
  balcony: number | null;
  terrace: number | null;
}>;

export type HousingPaymentContext = Readonly<{
  deposit: Readonly<{
    required: boolean | null;
    kind: string | null;
    amount: number | null;
    currency: string | null;
  }>;
  prepaymentMonths: number | null;
  utilities: string | null;
  commission: Readonly<{
    required: boolean | null;
    percent: number | null;
  }>;
}>;

export type HousingInfrastructureDistance = Readonly<{
  value: number | null;
  unit: 'minute' | 'meter' | 'kilometer';
  mode: 'walk' | 'drive' | null;
}>;

export type HousingInfrastructureMatch = Readonly<{
  poi: string;
  relation: string | null;
  distance: HousingInfrastructureDistance | null;
  start: number;
  end: number;
}>;

export type HousingStructuredResult = Readonly<{
  intent: Readonly<{ action: string | null; listingKind: string | null; dealType: string }> | null;
  context: Readonly<Record<string, unknown>>;
  rooms: number | null;
  floor: Readonly<{ floor: number | null; totalFloors: number | null }>;
  area: HousingAreaDetails;
  payments: HousingPaymentContext;
  seller: Readonly<{ type: 'owner' | 'agency' | null; confidence: number }>;
  infrastructure: readonly HousingInfrastructureMatch[];
}>;

export function parseHousingRoomCount(value: unknown): number | null;
export function parseHousingFloor(value: unknown): Readonly<{ floor: number | null; totalFloors: number | null }>;
export function parseHousingAreas(value: unknown): HousingAreaDetails;
export function parseHousingPayments(value: unknown): HousingPaymentContext;
export function parseHousingSeller(value: unknown): Readonly<{ type: 'owner' | 'agency' | null; confidence: number }>;
export function parseHousingInfrastructure(value: unknown): readonly HousingInfrastructureMatch[];
export function parseHousingStructured(value: unknown): HousingStructuredResult;
