import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalSkillName,
  extractSkillDetails,
  extractSkillNames,
  getSkillMeta,
} from '../src/hiring-skills.js';

test('shared skill catalog canonicalizes aliases and preserves metadata', () => {
  assert.equal(canonicalSkillName('vue.js'), 'Vue');
  assert.equal(canonicalSkillName('postgres'), 'PostgreSQL');
  assert.equal(canonicalSkillName('scss'), 'Sass');
  assert.deepEqual(getSkillMeta('nuxt.js'), { category: 'IT', subcategory: 'Frontend' });
});

test('shared skill matcher preserves unicode-aware token boundaries', () => {
  const names = extractSkillNames('Vue.js, TypeScript, PostgreSQL, Docker');
  for (const name of ['Vue', 'TypeScript', 'PostgreSQL', 'Docker']) assert.ok(names.includes(name));
  assert.equal(extractSkillNames('reactive user interactions').includes('React'), false);
});

test('shared skill details keep categories for ATS and enrichment consumers', () => {
  const detail = extractSkillDetails('Kubernetes').find(({ name }) => name === 'Kubernetes');
  assert.deepEqual(detail, { name: 'Kubernetes', category: 'IT', subcategory: 'DevOps & Cloud' });
});
