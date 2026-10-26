import type { EvidenceLedger, EvidenceOccurrence } from './evidence-ledger.js';
import type { AcceptanceThresholds } from './resolver-v2.js';
export type CityMatch = Readonly<{
  name: string; matchedText?: string; key?: string; type?: string; start?: number; end?: number;
  explicitContext?: boolean; parent?: string | null; role?: string;
}>;
export interface CityHypothesisOptions {
  explicitCity?: string | null; preferredCity?: string | null; cityNames?: readonly string[];
  isAmbiguous?: (match: CityMatch) => boolean; acceptance?: Partial<AcceptanceThresholds>;
}
export type CityHypothesis = Readonly<{
  cityId: string; score: number; evidence: readonly EvidenceOccurrence[]; contradictions: readonly EvidenceOccurrence[];
  independentEvidenceCount: number; ledger: EvidenceLedger;
}>;
export const DEFAULT_CITY_ACCEPTANCE: AcceptanceThresholds;
export function scoreCityHypotheses(byCity: readonly Readonly<{ city: string; matches: readonly CityMatch[] }>[], options?: CityHypothesisOptions): Readonly<{
  city: string | null; hypotheses: readonly CityHypothesis[]; unresolvedReasons: readonly string[];
}>;
