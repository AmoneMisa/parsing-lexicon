import type { ParseCandidate } from './parser-core.js';
import type { HousingMoneyParseContext } from './housing-money.js';
import type { TemporalContext } from './temporal.js';
export type HousingV2Context = HousingMoneyParseContext & TemporalContext;
export function extractHousingNumericCandidates(value: unknown, context?: HousingV2Context): readonly ParseCandidate[];
export function parseHousingV2(value: unknown, context?: HousingV2Context): Readonly<{ data: Readonly<Record<string, unknown>>; confidence: Readonly<Record<string, number>>; debug: Readonly<{ candidates: readonly ParseCandidate[]; discardedCandidates: readonly ParseCandidate[]; refinersApplied: readonly string[] }> }>;
