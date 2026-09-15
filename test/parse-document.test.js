import test from 'node:test';
import assert from 'node:assert/strict';
import { createParseDocument, normalizeParserText, runCandidatePipeline } from '../src/parser-core.js';
import { detectNonAddressSpans } from '../src/semantic-spans.js';
import { classifyCvSectionHeading } from '../src/hiring-requirements.js';

test('document caches normalization, tokens, bounded spans and read-only ngrams', () => {
  const doc = createParseDocument('  ﬃ — 80 м²\n🙂  ');
  assert.equal(doc.original, '  ﬃ — 80 м²\n🙂  ');
  assert.equal(doc.normalized, normalizeParserText(doc.original).normalizedText);
  assert.deepEqual(doc.offsetMap.toOriginalRange(0, 3), { start: 2, end: 3 });
  assert.strictEqual(doc.tokens, doc.tokens);
  assert.strictEqual(doc.getTokenSpans(3), doc.getTokenSpans(3));
  assert.ok(doc.getTokenSpans(3).every(span => span.tokenEnd - span.tokenStart <= 3));
  assert.strictEqual(doc.getNgrams(3), doc.getNgrams(3));
  assert.equal(doc.getNgrams(3).add, undefined);
  assert.throws(() => doc.getNgrams(Infinity), RangeError);
  assert.equal(createParseDocument(doc), doc);
  for (const token of doc.tokens) assert.equal(doc.original.slice(token.start, token.end), token.raw);
});

test('lines and section spans retain CRLF and original whitespace offsets', () => {
  const doc = createParseDocument('Profile\r\n  Developer\r\n\r\nSkills\r\nDocker', { classifySection: classifyCvSectionHeading });
  assert.deepEqual(doc.sections.map(section => section.section), ['profile', 'skills']);
  for (const line of doc.lines) assert.equal(doc.original.slice(line.start, line.end), line.text);
  const skills = doc.sections[1];
  assert.equal(doc.original.slice(skills.contentStart, skills.end), 'Docker');
  assert.equal(doc.original.slice(skills.headingRange.start, skills.headingRange.end), 'Skills');
  assert.strictEqual(doc.sections, doc.sections);
});

test('semantic spans reuse the existing extractor and are memoized', () => {
  const text = 'Телефон +998 90 123 45 67, аренда 500 USD, от 3 месяцев';
  const context = { country: 'UZ' }; const doc = createParseDocument(text, { context });
  assert.deepEqual(doc.semanticSpans, detectNonAddressSpans(text, context));
  assert.strictEqual(doc.semanticSpans, doc.semanticSpans);
});

test('unrequested expensive sections stay lazy and pipelines share a document', () => {
  let headings = 0;
  const doc = createParseDocument('Skills\nDocker', { classifySection() { headings++; return null; } });
  const seen = [];
  runCandidatePipeline(doc, { parsers: [input => { seen.push(input.document); return []; }], refiners: [(candidates, input) => { seen.push(input.document); return candidates; }] });
  assert.equal(headings, 0);
  assert.deepEqual(seen, [doc, doc]);
  assert.equal(doc.sections.length, 1);
  assert.equal(headings, 2);
});

test('legacy pipeline properties and debug tokens remain compatible', () => {
  const output = runCandidatePipeline('3-к', { debug: true, parsers: [input => {
    assert.equal(input.originalText, '3-к'); assert.equal(input.normalizedText, '3-к');
    assert.strictEqual(input.tokens, input.document.tokens);
    assert.strictEqual(input.spans, input.document.getTokenSpans());
    return [];
  }] });
  assert.equal(output.debug.tokens.length, 3);
  assert.ok(output.debug.spans.length);
});

test('fractional span requests share bounded integer cache keys', () => {
  const doc = createParseDocument('one two three four');
  for (let i = 0; i < 100; i++) assert.strictEqual(doc.getTokenSpans(3 + i / 100), doc.getTokenSpans(3));
});
