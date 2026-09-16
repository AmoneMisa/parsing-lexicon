export type ProvenanceSource = 'structured_api' | 'source_adapter' | 'labelled_field' | 'description' | 'ai_enrichment';

export const PROVENANCE_SOURCES: Readonly<Record<ProvenanceSource, number>>;
/** Strongest first. */
export const PROVENANCE_ORDER: readonly ProvenanceSource[];

export type Provenance = Readonly<{
  source: ProvenanceSource;
  parser?: string;
  observedAt?: string;
  confidence?: number;
  start?: number;
  end?: number;
  [key: string]: unknown;
}>;

export type ProvenancedValue<T = unknown> = Readonly<{ value: T; provenance?: Provenance }>;

export function createProvenance(input: Partial<Provenance> & Pick<Provenance, 'source'>): Provenance;
export function provenanceRank(provenance: Provenance | undefined): number;
export function isDeterministic(provenance: Provenance | undefined): boolean;
export function shouldReplaceProvenance(current: Provenance | undefined, incoming: Provenance | undefined): boolean;
export function createProvenancedValue<T>(value: T, provenance?: Provenance): ProvenancedValue<T>;
export function mergeProvenancedValue<T>(current: ProvenancedValue<T> | undefined, incoming: ProvenancedValue<T> | undefined): ProvenancedValue<T> | undefined;
export function mergeProvenancedRecord(current?: Readonly<Record<string, ProvenancedValue>>, incoming?: Readonly<Record<string, ProvenancedValue>>): Readonly<Record<string, ProvenancedValue>>;
