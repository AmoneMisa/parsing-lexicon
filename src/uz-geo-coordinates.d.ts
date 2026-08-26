export type UzbekistanGeoPoint = Readonly<{ lat: number; lng: number; accuracyM?: number }>;
export type UzbekistanCoordinateFallback = Readonly<UzbekistanGeoPoint & {
  accuracy: 'exact' | 'city';
  source: 'location' | 'city';
}>;

export const UZ_CITY_COORDINATES: Readonly<Record<string, UzbekistanGeoPoint>>;
export const UZ_LOCATION_COORDINATES: Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, UzbekistanGeoPoint>>>>>>;

export function uzbekistanCityCoordinates(value: unknown): UzbekistanGeoPoint | null;
export function uzbekistanCityGeocodeCandidates(value: unknown): readonly string[];
export function uzbekistanLocationCoordinates(cityValue: unknown, type: string, locationValue: unknown): UzbekistanGeoPoint | null;
export function uzbekistanLocationGeocodeCandidates(cityValue: unknown, type: string, locationValue: unknown): readonly string[];
export function uzbekistanCoordinateFallback(cityValue: unknown, type?: string | null, locationValue?: unknown): UzbekistanCoordinateFallback | null;