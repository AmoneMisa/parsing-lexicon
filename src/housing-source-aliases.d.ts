export const HOUSING_DEAL_TYPE_EXTENSIONS: readonly unknown[];
export const HOUSING_ROOM_ONLY_EXTENSIONS: readonly unknown[];

export type HousingSource = 'Threads' | null;
export type HousingSourcePost = Readonly<{
  source: HousingSource;
  contact: string | null;
  text: string;
}>;

export function detectHousingSource(value: unknown): HousingSource;
export function cleanHousingSourceText(value: unknown, options?: { source?: HousingSource | 'threads' }): string;
export function parseHousingSourcePost(value: unknown, options?: { source?: HousingSource | 'threads' }): HousingSourcePost;

export function resolveExtendedHousingIntent(value: unknown): Readonly<{
  action: string | null;
  listingKind: string | null;
  dealType: 'sale' | 'longRent' | 'shortRent';
}> | null;
export function isRoomOnlyHousing(value: unknown): boolean;
