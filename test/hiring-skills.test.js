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

test('bare JS/TS shorthand and the R language are recognized without common false positives', () => {
  const names = extractSkillNames('I know JS and TS well, plus R and RStudio for stats');
  for (const name of ['JavaScript', 'TypeScript', 'R']) assert.ok(names.includes(name), `${name} should be detected`);
  assert.equal(extractSkillNames('Built components with jsx and tsx').length, 0);
  assert.equal(extractSkillNames('We wrote comprehensive tests and arts and crafts projects').includes('TypeScript'), false);
});

test('shared skill matcher handles contextual non-adjacent phrases', () => {
  const names = extractSkillNames('Analyse onboarding funnel data and work cross functionally on company governance.');
  for (const name of ['Data Analysis', 'Conversion Funnel', 'Cross-functional Collaboration', 'Corporate Governance']) {
    assert.ok(names.includes(name), `${name} should be detected`);
  }
  assert.equal(extractSkillNames('functional programming and governance policy').includes('Cross-functional Collaboration'), false);
});
