import type { ParseCandidate } from './parser-core.js';
import type { EvidenceLedger } from './evidence-ledger.js';

export type Cardinality = 'single' | 'many' | 'roleBased';
export const DEFAULT_BEAM_WIDTH: number;
export const CARDINALITIES: readonly Cardinality[];

export type AcceptanceThresholds = Readonly<{ minScore: number; minMargin: number; minIndependentEvidence: number; criticalContradiction: number }>;
export const DEFAULT_ACCEPTANCE: AcceptanceThresholds;

export type ResolverWeightTable = Readonly<Record<string, number>> | ((key: string | undefined) => number | undefined);

export type ResolveEvidenceOptions = {
  cardinality?: Cardinality | Readonly<Record<string, Cardinality>> & { default?: Cardinality };
  beamWidth?: number;
  acceptance?: Partial<AcceptanceThresholds>;
  sourcePriority?: ResolverWeightTable;
  sectionRelevance?: ResolverWeightTable;
  score?: (candidate: ParseCandidate) => number;
  roleOf?: (candidate: ParseCandidate) => string | undefined;
  parentOf?: (candidate: ParseCandidate) => string | undefined;
  contradicts?: (left: ParseCandidate, right: ParseCandidate) => boolean;
  compatible?: (left: ParseCandidate, right: ParseCandidate, config: unknown) => boolean;
};

export type CandidateHypothesis = Readonly<{ candidate: ParseCandidate; score: number; independentEvidenceCount: number; ledger: EvidenceLedger }>;
export type UnresolvedEntity = Readonly<{ entityType: string; score: number; margin: number | null; independentEvidenceCount: number; reasons: readonly string[] }>;

export function scoreEvidenceCandidate(candidate: ParseCandidate, options?: ResolveEvidenceOptions): number;
export function resolveEvidenceCandidates(candidates: readonly ParseCandidate[], options?: ResolveEvidenceOptions): Readonly<{
  selected: readonly ParseCandidate[];
  discarded: readonly ParseCandidate[];
  unresolved: readonly UnresolvedEntity[];
  scores: ReadonlyMap<ParseCandidate, number>;
  hypotheses: Readonly<Record<string, readonly CandidateHypothesis[]>>;
  searched: boolean;
  total: number;
}>;
