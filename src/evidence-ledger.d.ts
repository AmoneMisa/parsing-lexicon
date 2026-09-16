export type EvidenceDimension = 'lexical' | 'structural' | 'section' | 'source' | 'hierarchy' | 'specificity' | 'ambiguity' | 'fuzzy' | 'contradiction' | 'role';
export const EVIDENCE_DIMENSIONS: Readonly<Record<EvidenceDimension, 1 | -1>>;
export const DEFAULT_EVIDENCE_DECAY: number;

export type EvidenceOccurrence = Readonly<{
  dimension: EvidenceDimension;
  source: string;
  section?: string;
  start?: number;
  end?: number;
  entityId?: string;
  evidenceGroup?: string;
  weight: number;
}>;

export type EvidenceDimensionTotals = Readonly<{ raw: number; effective: number; count: number }>;

/** `score` is a heuristic weight, not a probability. */
export type EvidenceLedger = Readonly<{
  occurrences: readonly EvidenceOccurrence[];
  dimensions: Readonly<Partial<Record<EvidenceDimension, EvidenceDimensionTotals>>>;
  score: number;
  independentEvidenceCount: number;
  decay: number;
  readonly penalty: number;
}>;

export function createEvidenceOccurrence(input: Partial<EvidenceOccurrence> & Pick<EvidenceOccurrence, 'dimension' | 'source'>): EvidenceOccurrence;
export function createEvidenceLedger(occurrences?: readonly Partial<EvidenceOccurrence>[], options?: { decay?: number }): EvidenceLedger;
export const EMPTY_EVIDENCE_LEDGER: EvidenceLedger;
export function mergeEvidenceLedgers(...ledgers: readonly (EvidenceLedger | null | undefined)[]): EvidenceLedger;
