import type { ParseCandidate } from './parser-core.js';
import type { HousingMoneyParseContext } from './housing-money.js';
import type { TemporalContext } from './temporal.js';
export type HousingV2Context = HousingMoneyParseContext & TemporalContext & Readonly<{
  country?: string;
  city?: string;
  knownStreet?: string | null;
  knownStreets?: readonly string[];
  resolveGeoEntity?: ((input: Readonly<{ country: string; city?: string; type: string; canonical: string }>) => Readonly<{
    id: string;
    canonicalName?: string;
    canonical?: string;
    type?: string;
    country?: string;
    parentId?: string;
  }> | null | undefined);
}>;
export function extractHousingNumericCandidates(value: unknown, context?: HousingV2Context): readonly ParseCandidate[];
export function extractHousingAddressCandidates(value: unknown, context?: HousingV2Context): readonly ParseCandidate[];
export function parseHousingV2(value: unknown, context?: HousingV2Context): Readonly<{ data: Readonly<Record<string, unknown>>; confidence: Readonly<Record<string, number>>; debug: Readonly<{ candidates: readonly ParseCandidate[]; discardedCandidates: readonly ParseCandidate[]; refinersApplied: readonly string[] }> }>;
