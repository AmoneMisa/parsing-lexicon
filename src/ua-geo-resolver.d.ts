import type { UkraineGeoPoint } from './ua-geo-coordinates.js';

export type UkraineLocationCoordinateDescriptor = Readonly<{
  city: string;
  type: string;
  canonical: string;
  aliases: readonly string[];
  coordinates: UkraineGeoPoint | null;
  source: 'static' | 'geocode';
  candidates: readonly string[];
}>;

export type UkraineResolvedLocationCoordinate = Readonly<Omit<UkraineLocationCoordinateDescriptor, 'source'> & {
  source: 'static' | 'geocode' | 'unresolved';
}>;

export type UkraineCoordinateCoverage = Readonly<{
  total: number;
  static: number;
  resolvable: number;
  missing: number;
  byType: Readonly<Record<string, Readonly<{ total: number; static: number; resolvable: number }>>>;
}>;

export function ukraineLocationCoordinateDescriptors(): readonly UkraineLocationCoordinateDescriptor[];
export function ukraineLocationCoordinateCoverage(): UkraineCoordinateCoverage;
export function resolveUkraineLocationCoordinates(
  lookup: ((query: string, descriptor: UkraineLocationCoordinateDescriptor) => Promise<UkraineGeoPoint | null | undefined> | UkraineGeoPoint | null | undefined) | null | undefined,
  options?: Readonly<{ cities?: readonly string[]; types?: readonly string[]; maxLookups?: number }>,
): Promise<readonly UkraineResolvedLocationCoordinate[]>;
export function staticUkraineLocationCoordinateCount(): number;
