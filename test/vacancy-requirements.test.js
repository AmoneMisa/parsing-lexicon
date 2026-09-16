import test from 'node:test';
import assert from 'node:assert/strict';
import { extractVacancyRequirements, vacancyRequirementBuckets, REQUIREMENT_MODALITIES } from '../src/vacancy-requirements.js';

const modalityFor = (text, skill) => extractVacancyRequirements(text).find(item => item.skills.includes(skill))?.modality;

test('the five modalities are exactly those named by the contract', () => {
  assert.deepEqual([...REQUIREMENT_MODALITIES], ['required', 'preferred', 'bonus', 'context', 'negated']);
});

test('a requirements heading makes its bullets required', () => {
  assert.equal(modalityFor('Requirements\n- Docker\n', 'Docker'), 'required');
});

test('hard wording is required wherever it appears', () => {
  assert.equal(modalityFor('You must have strong experience with Kubernetes.', 'Kubernetes'), 'required');
  assert.equal(modalityFor('Обязательно знание Docker.', 'Docker'), 'required');
});

test('preferred, bonus, exposure and negation are kept apart', () => {
  assert.equal(modalityFor('Preferably some Docker.', 'Docker'), 'preferred');
  assert.equal(modalityFor('Docker would be a plus.', 'Docker'), 'bonus');
  assert.equal(modalityFor('Exposure to Docker is fine.', 'Docker'), 'context');
  assert.equal(modalityFor('No Docker experience required.', 'Docker'), 'negated');
});

test('in-text wording beats the surrounding section', () => {
  const text = ['Requirements', '- Kubernetes', '- Docker would be a plus', '- No Terraform experience required'].join('\n');
  assert.equal(modalityFor(text, 'Kubernetes'), 'required');
  assert.equal(modalityFor(text, 'Docker'), 'bonus', 'a bonus line under Requirements is still a bonus');
  assert.equal(modalityFor(text, 'Terraform'), 'negated');
});

test('a stack we are migrating away from is not a requirement', () => {
  assert.equal(modalityFor('We are migrating away from PHP.', 'PHP'), 'negated');
  assert.equal(modalityFor('Our legacy Java services are being replaced.', 'Java'), 'negated');
});

test('"our stack includes" is context, not a demand', () => {
  assert.equal(modalityFor('Our stack includes Kafka.', 'Kafka'), 'context');
  assert.equal(modalityFor('You will be working with Redis.', 'Redis'), 'context');
});

test('modality is detected in every supported language', () => {
  assert.equal(modalityFor('Обязательно знание Docker.', 'Docker'), 'required');
  assert.equal(modalityFor('Docker буде плюсом.', 'Docker'), 'bonus');
  assert.equal(modalityFor('Docker tajriba shart emas.', 'Docker'), 'negated');
  assert.equal(modalityFor('Docker талап етіледі.', 'Docker'), 'required');
  assert.equal(modalityFor('Docker este obligatoriu.', 'Docker'), 'required');
  assert.equal(modalityFor('Docker de dorit.', 'Docker'), 'preferred');
});

test('each requirement keeps its source range and provenance', () => {
  const text = 'Requirements\n- Docker\n';
  const [requirement] = extractVacancyRequirements(text);
  assert.equal(text.slice(requirement.start, requirement.end).trim(), '- Docker');
  assert.equal(requirement.provenance.parser, 'vacancy.requirements.modality');
  assert.equal(requirement.provenance.section, 'requirements');
  assert.equal(requirement.provenance.signal, 'section');
  assert.equal(requirement.blockType, 'bullet');
});

test('provenance says whether wording or the section decided the modality', () => {
  const [fromWording] = extractVacancyRequirements('Docker would be a plus.');
  assert.equal(fromWording.provenance.signal, 'wording');
  const [fromSection] = extractVacancyRequirements('Requirements\n- Docker\n');
  assert.equal(fromSection.provenance.signal, 'section');
});

test('a required skill outweighs a bonus one in the ledger', () => {
  const text = ['Requirements', '- Kubernetes', '- Docker would be a plus'].join('\n');
  const requirements = extractVacancyRequirements(text);
  const required = requirements.find(item => item.skills.includes('Kubernetes'));
  const bonus = requirements.find(item => item.skills.includes('Docker'));
  assert.ok(required.ledger.score > bonus.ledger.score);
});

test('the two-bucket view stays compatible with required and niceToHave', () => {
  const buckets = vacancyRequirementBuckets(['Requirements', '- Kubernetes', '- Docker would be a plus', 'Nice to have', '- GraphQL'].join('\n'));
  assert.deepEqual(buckets.required, ['Kubernetes']);
  assert.deepEqual([...buckets.niceToHave].sort(), ['Docker', 'GraphQL']);
});

test('context and negated skills reach neither bucket', () => {
  const buckets = vacancyRequirementBuckets('Requirements\n- Kubernetes\nOur stack includes Kafka.\nNo Terraform experience required.');
  assert.deepEqual(buckets.required, ['Kubernetes']);
  assert.deepEqual(buckets.niceToHave, []);
  assert.deepEqual(buckets.excluded, ['Terraform']);
});

test('a skill the posting rejects is removed even if named as required elsewhere', () => {
  const buckets = vacancyRequirementBuckets('Requirements\n- Experience with PHP\nWe are migrating away from PHP.');
  assert.ok(!buckets.required.includes('PHP'), 'an explicit rejection wins over an earlier mention');
  assert.deepEqual(buckets.excluded, ['PHP']);
});

test('a required skill is not also listed as nice to have', () => {
  const buckets = vacancyRequirementBuckets('Requirements\n- Docker\nNice to have\n- Docker');
  assert.deepEqual(buckets.required, ['Docker']);
  assert.deepEqual(buckets.niceToHave, []);
});

test('noise sections contribute nothing', () => {
  const buckets = vacancyRequirementBuckets('Equal opportunity employer\n- We use Docker in our hiring process');
  assert.deepEqual(buckets.required, []);
  assert.deepEqual(buckets.niceToHave, []);
});

test('lines without skills produce no requirements', () => {
  assert.deepEqual(extractVacancyRequirements('Requirements\n- A positive attitude\n'), []);
  assert.deepEqual(extractVacancyRequirements(''), []);
  assert.deepEqual(extractVacancyRequirements(null), []);
});

test('buckets accept already-extracted requirements without re-parsing', () => {
  const requirements = extractVacancyRequirements('Requirements\n- Docker\n');
  assert.deepEqual(vacancyRequirementBuckets(requirements).required, ['Docker']);
});
