import type { HousingAddressParts } from './housing-address.js';
import type { HousingListingFields } from './housing-listing-fields.js';
import type { HousingPriceParseResult } from './housing-money.js';
import type { ParsedPhoneNumber, TelegramContact } from './contact.js';

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

export type HousingStructuredPaymentContext = Readonly<HousingPaymentContext & {
  depositMonths: number | null;
  commissionAmount: Readonly<{
    amount: number | null;
    currency: string | null;
  }>;
}>;

export type HousingInfrastructureDistance = Readonly<{
  value: number | null;
  unit: 'minute' | 'meter' | 'kilometer';
  mode: 'walk' | 'drive' | null;
}>;

export type HousingInfrastructureMatch = Readonly<{
  poi: string;
  raw: string;
  name: string | null;
  number: number | null;
  relation: string | null;
  distance: HousingInfrastructureDistance | null;
  start: number;
  end: number;
}>;

export type HousingContactPhone = Readonly<ParsedPhoneNumber & {
  name: string | null;
}>;

export type HousingStructuredContacts = Readonly<{
  phones: readonly HousingContactPhone[];
  telegram: readonly TelegramContact[];
  source: Readonly<{ source: string | null; value: string }> | null;
}>;

export type HousingStructuredOptions = Readonly<{
  country?: string;
  fallbackCurrency?: string;
  phoneCountry?: string;
  source?: string;
  knownStreet?: string | null;
  allowBareAddress?: boolean;
  allowDelimitedBareAddress?: boolean;
}>;

export type HousingStructuredResult = Readonly<{
  text: string;
  source: Readonly<{ platform: string | null; contact: string | null }>;
  intent: Readonly<{ action: string | null; listingKind: string | null; dealType: string }> | null;
  context: Readonly<Record<string, unknown>>;
  rooms: number | null;
  floor: Readonly<{ floor: number | null; totalFloors: number | null }>;
  area: HousingAreaDetails;
  price: HousingPriceParseResult;
  address: HousingAddressParts;
  residentialComplex: string | null;
  amenities: readonly string[];
  listingFields: Readonly<Partial<HousingListingFields>>;
  payments: HousingStructuredPaymentContext;
  seller: Readonly<{ type: 'owner' | 'agency' | null; confidence: number }>;
  infrastructure: readonly HousingInfrastructureMatch[];
  contacts: HousingStructuredContacts;
}>;

export function parseHousingRoomCount(value: unknown): number | null;
export function parseHousingFloor(value: unknown): Readonly<{ floor: number | null; totalFloors: number | null }>;
export function parseHousingAreas(value: unknown): HousingAreaDetails;
export function parseHousingPayments(value: unknown): HousingPaymentContext;
export function parseHousingSeller(value: unknown): Readonly<{ type: 'owner' | 'agency' | null; confidence: number }>;
export function parseHousingInfrastructure(value: unknown): readonly HousingInfrastructureMatch[];
export function parseHousingStructured(value: unknown, options?: HousingStructuredOptions): HousingStructuredResult;
