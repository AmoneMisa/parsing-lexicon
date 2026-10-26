import type { EvidenceDimension, EvidenceLedger } from './evidence-ledger.js';
export type ResolverWeights = Readonly<Record<EvidenceDimension, number>>;
export type LedgerFeatures = Readonly<Partial<Record<EvidenceDimension, number>>>;
export interface WeightSample { features: LedgerFeatures; label: number | boolean; id?: string }
export const DEFAULT_RESOLVER_WEIGHTS: ResolverWeights;
export const MIN_WEIGHT: number;
export const MAX_WEIGHT: number;
export function normalizeResolverWeights(weights?: Readonly<Record<string, number>>): ResolverWeights;
export function ledgerFeatures(ledger?: EvidenceLedger | null): Record<EvidenceDimension, number>;
export function weightedLedgerScore(ledger: EvidenceLedger, weights?: ResolverWeights): number;
export function fitLogisticWeights(samples: readonly WeightSample[], options?: { iterations?: number; learningRate?: number; l2?: number; minSamples?: number }):
  | { weights: ResolverWeights; fitted: false; reason: 'insufficient_samples'; sampleCount: number }
  | { weights: ResolverWeights; fitted: true; sampleCount: number; positiveCount: number };
export function scoreRankingAccuracy(groups: readonly { samples: readonly WeightSample[] }[], weights: ResolverWeights): number;
