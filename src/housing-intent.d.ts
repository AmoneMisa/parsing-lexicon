export type HousingAction = 'sell' | 'buy' | 'rentOut' | 'rentIn';
export type HousingListingKind = 'propertyOffer' | 'propertyWanted';
export type HousingDealType = 'sale' | 'longRent' | 'shortRent';
export type HousingIntentResult = Readonly<{ action: HousingAction; listingKind: HousingListingKind; dealType: HousingDealType }>;
export const HOUSING_ACTIONS: readonly unknown[];
export const HOUSING_INTENT: readonly unknown[];
export const HOUSING_DEAL_TYPES: readonly unknown[];
export const HOUSING_ACTION_MAP: Readonly<Record<HousingAction, Readonly<{ listingKind: HousingListingKind; dealType: Exclude<HousingDealType, 'shortRent'> }>>>;
export function resolveHousingIntent(value: unknown): HousingIntentResult | null;
export declare function classifyHousingDealType(value: unknown): 'sale' | 'longRent' | 'shortRent' | null;

