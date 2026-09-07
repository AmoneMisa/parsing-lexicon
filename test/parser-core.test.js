import test from 'node:test';
import assert from 'node:assert/strict';
import { createParseCandidate, generateParserSpans, normalizeParserText, resolveParseCandidates, runCandidatePipeline, tokenizeParserText } from '../src/parser-core.js';

test('parser core normalizes conservatively while preserving original ranges', () => {
  const normalized = normalizeParserText('  3-к\u00a0  80 м²  ');
  assert.equal(normalized.normalizedText, '3-к 80 м2');
  assert.deepEqual(normalized.toOriginalRange(0, 3), { start: 2, end: 5 });
});

test('tokenizer and bounded span generator preserve compact housing expressions', () => {
  const tokens = tokenizeParserText('$500 5/9 80м2 3-к');
  assert.ok(tokens.some((token) => token.normalized === '80м2'));
  assert.ok(tokens.some((token) => token.normalized === '3'));
  assert.ok(generateParserSpans(tokens, { maxTokens: 3 }).every((span) => span.tokenEnd - span.tokenStart <= 3));
});

test('central resolver preserves discarded overlapping candidates in debug output', () => {
  const broad = createParseCandidate({ id: 'geo', entityType: 'geo', start: 0, end: 12, confidence: .8 });
  const specific = createParseCandidate({ id: 'quarter', entityType: 'geo', start: 0, end: 14, confidence: .9 });
  const resolved = resolveParseCandidates([broad, specific]);
  assert.equal(resolved.selected[0].id, 'quarter');
  assert.equal(resolved.discarded[0].id, 'geo');
  const output = runCandidatePipeline('3к', { debug: true, parsers: [() => [createParseCandidate({ id: 'rooms', entityType: 'rooms', start: 0, end: 2, confidence: .95 })]] });
  assert.equal(output.data[0].entityType, 'rooms');
  assert.equal(output.debug.candidates.length, 1);
});
