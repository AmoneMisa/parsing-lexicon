import type { ParseCandidate } from './parser-core.js';
import type { ParseDocument } from './parse-document.js';
export interface MicroGrammarContext { domain?: 'housing' | 'jobs' | null }
export function extractMicroGrammarCandidates(value: unknown, context?: MicroGrammarContext): readonly ParseCandidate[];
export function microGrammarParser(input: { originalText?: unknown; document?: ParseDocument; context?: MicroGrammarContext }): readonly ParseCandidate[];
