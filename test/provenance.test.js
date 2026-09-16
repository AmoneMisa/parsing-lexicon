import test from 'node:test';
import assert from 'node:assert/strict';
import { createProvenance, provenanceRank, isDeterministic, shouldReplaceProvenance, createProvenancedValue, mergeProvenancedValue, mergeProvenancedRecord, PROVENANCE_SOURCES, PROVENANCE_ORDER } from '../src/provenance.js';
import { extractVacancyRequirements } from '../src/vacancy-requirements.js';

const at = (source, extra = {}) => createProvenance({ source, ...extra });
const valued = (value, source, extra = {}) => createProvenancedValue(value, at(source, extra));

test('the source ordering is structured, adapter, labelled, description, AI', () => {
  assert.deepEqual([...PROVENANCE_ORDER], ['structured_api', 'source_adapter', 'labelled_field', 'description', 'ai_enrichment']);
  assert.ok(PROVENANCE_SOURCES.structured_api > PROVENANCE_SOURCES.source_adapter);
  assert.ok(PROVENANCE_SOURCES.source_adapter > PROVENANCE_SOURCES.labelled_field);
  assert.ok(PROVENANCE_SOURCES.labelled_field > PROVENANCE_SOURCES.description);
  assert.ok(PROVENANCE_SOURCES.description > PROVENANCE_SOURCES.ai_enrichment);
});

test('a provenance keeps the fields it was given and drops absent ones', () => {
  const provenance = at('description', { parser: 'housing.price', observedAt: '2026-01-02T03:04:05.000Z', confidence: 0.8, start: 4, end: 9 });
  assert.deepEqual({ ...provenance }, { source: 'description', parser: 'housing.price', observedAt: '2026-01-02T03:04:05.000Z', confidence: 0.8, start: 4, end: 9 });
  assert.deepEqual(Object.keys(at('structured_api')), ['source']);
});

test('a provenance rejects unknown sources and malformed fields', () => {
  assert.throws(() => at('vibes'), TypeError);
  assert.throws(() => at('description', { confidence: 2 }), TypeError);
  assert.throws(() => at('description', { confidence: -1 }), TypeError);
  assert.throws(() => at('description', { start: 5 }), TypeError);
  assert.throws(() => at('description', { start: 9, end: 2 }), TypeError);
  assert.throws(() => at('description', { observedAt: 'yesterday' }), TypeError);
});

test('only AI enrichment is non-deterministic', () => {
  for (const source of ['structured_api', 'source_adapter', 'labelled_field', 'description']) assert.equal(isDeterministic(at(source)), true, source);
  assert.equal(isDeterministic(at('ai_enrichment')), false);
  assert.equal(provenanceRank(undefined), -1);
});

test('a stronger source replaces a weaker one', () => {
  assert.equal(shouldReplaceProvenance(at('description'), at('structured_api')), true);
  assert.equal(shouldReplaceProvenance(at('ai_enrichment'), at('description')), true);
});

test('AI enrichment never overwrites deterministic data, however confident', () => {
  for (const source of ['structured_api', 'source_adapter', 'labelled_field', 'description']) {
    assert.equal(shouldReplaceProvenance(at(source, { confidence: 0.1 }), at('ai_enrichment', { confidence: 1 })), false, `AI must not beat ${source}`);
  }
});

test('AI enrichment may fill a field nothing else established', () => {
  assert.equal(shouldReplaceProvenance(undefined, at('ai_enrichment')), true);
  assert.deepEqual(mergeProvenancedValue(undefined, valued('UZ', 'ai_enrichment')).value, 'UZ');
});

test('equal sources are broken by confidence, then recency', () => {
  assert.equal(shouldReplaceProvenance(at('description', { confidence: 0.5 }), at('description', { confidence: 0.9 })), true);
  assert.equal(shouldReplaceProvenance(at('description', { confidence: 0.9 }), at('description', { confidence: 0.5 })), false);
  assert.equal(shouldReplaceProvenance(at('description', { observedAt: '2026-01-01T00:00:00.000Z' }), at('description', { observedAt: '2026-02-01T00:00:00.000Z' })), true);
  assert.equal(shouldReplaceProvenance(at('description', { observedAt: '2026-02-01T00:00:00.000Z' }), at('description', { observedAt: '2026-01-01T00:00:00.000Z' })), false);
});

test('an exact tie keeps the existing value so reparsing does not churn', () => {
  assert.equal(shouldReplaceProvenance(at('description'), at('description')), false);
  const current = valued('old', 'description');
  assert.equal(mergeProvenancedValue(current, valued('new', 'description')), current);
});

test('a missing incoming value never erases a known one', () => {
  const current = valued('Tashkent', 'structured_api');
  for (const empty of [undefined, null, '']) {
    assert.equal(mergeProvenancedValue(current, valued(empty, 'structured_api')), current, `${JSON.stringify(empty)} must not erase`);
  }
  assert.equal(mergeProvenancedValue(current, undefined), current);
});

test('a known incoming value fills an empty current one', () => {
  assert.equal(mergeProvenancedValue(valued('', 'structured_api'), valued('Tashkent', 'description')).value, 'Tashkent');
});

test('records merge field by field and keep the winner of each', () => {
  const current = { city: valued('Tashkent', 'structured_api'), price: valued(100, 'description'), rooms: valued(2, 'ai_enrichment') };
  const incoming = { city: valued('Almaty', 'ai_enrichment'), price: valued(120, 'labelled_field'), metro: valued('Chilonzor', 'description') };
  const merged = mergeProvenancedRecord(current, incoming);
  assert.equal(merged.city.value, 'Tashkent', 'AI must not overwrite a structured city');
  assert.equal(merged.price.value, 120, 'a labelled field beats a description parse');
  assert.equal(merged.rooms.value, 2, 'a field only AI knows is kept');
  assert.equal(merged.metro.value, 'Chilonzor', 'a new field is added');
});

test('merging an empty record changes nothing', () => {
  const current = { city: valued('Tashkent', 'structured_api') };
  assert.deepEqual(mergeProvenancedRecord(current, {}), current);
  assert.deepEqual(mergeProvenancedRecord({}, {}), {});
});

test('vacancy requirements emit canonical provenance', () => {
  const text = 'Requirements\n- Docker\n';
  const [requirement] = extractVacancyRequirements(text);
  assert.equal(requirement.provenance.source, 'description', 'a vacancy body is the semantic fallback tier');
  assert.equal(requirement.provenance.parser, 'vacancy.requirements.modality');
  assert.equal(provenanceRank(requirement.provenance), PROVENANCE_SOURCES.description);
  assert.equal(text.slice(requirement.provenance.start, requirement.provenance.end).trim(), '- Docker');
  assert.equal(requirement.provenance.signal, 'section', 'domain detail survives alongside the canonical fields');
});
