export const HOUSING_DEAL_TYPE_EXTENSIONS: readonly unknown[];
export const HOUSING_ROOM_ONLY_EXTENSIONS: readonly unknown[];
export function resolveExtendedHousingIntent(value: unknown): Readonly<{
  action: string | null;
  listingKind: string | null;
  dealType: 'sale' | 'longRent' | 'shortRent';
}> | null;
export function isRoomOnlyHousing(value: unknown): boolean;
