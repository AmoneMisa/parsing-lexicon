import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVacancyBlocks, classifyVacancyHeading, VACANCY_SECTIONS, VACANCY_HEADINGS, BLOCK_TYPES } from '../src/vacancy-blocks.js';
import { bucketVacancyText } from '../src/hiring-requirements.js';

const typesOf = text => parseVacancyBlocks(text).map(block => block.type);

test('block types are recognised from the line shape', () => {
  const text = ['Requirements', '- Vue', '* TypeScript', '1. Docker', 'Level: Senior', '| Skill | Years |', 'We are hiring a backend engineer for our team.'].join('\n');
  assert.deepEqual(typesOf(text), ['heading', 'bullet', 'bullet', 'bullet', 'key-value', 'table-row', 'paragraph']);
  for (const type of typesOf(text)) assert.ok(BLOCK_TYPES.includes(type));
});

test('a heading is a short line that names a section', () => {
  assert.equal(classifyVacancyHeading('Requirements'), 'requirements');
  assert.equal(classifyVacancyHeading('Nice to have'), 'optional');
  assert.equal(classifyVacancyHeading('What we offer'), 'benefits');
  assert.equal(classifyVacancyHeading('Responsibilities'), 'responsibilities');
  assert.equal(classifyVacancyHeading('About us'), 'about');
  assert.equal(classifyVacancyHeading('Equal opportunity employer'), 'noise');
});

test('prose is not mistaken for a heading', () => {
  for (const line of ['We have a few requirements for this role.', 'You will build things.', '']) {
    assert.equal(classifyVacancyHeading(line), null, `${JSON.stringify(line)} must not be a heading`);
  }
});

for (const [language, cases] of Object.entries({
  Russian: { 'Требования': 'requirements', 'Будет плюсом': 'optional', 'Обязанности': 'responsibilities', 'Что мы предлагаем': 'benefits', 'О компании': 'about' },
  Ukrainian: { 'Вимоги': 'requirements', 'Буде плюсом': 'optional', 'Обов\'язки': 'responsibilities', 'Що ми пропонуємо': 'benefits' },
  'Uzbek Latin': { 'Talablar': 'requirements', 'Vazifalar': 'responsibilities', 'Biz taklif qilamiz': 'benefits', 'Kompaniya haqida': 'about' },
  'Uzbek Cyrillic': { 'Талаблар': 'requirements', 'Вазифалар': 'responsibilities', 'Имтиёзлар': 'benefits' },
  Kazakh: { 'Талаптар': 'requirements', 'Міндеттер': 'responsibilities', 'Біз ұсынамыз': 'benefits' },
  Romanian: { 'Cerinte': 'requirements', 'Responsabilitati': 'responsibilities', 'Ce oferim': 'benefits', 'Beneficii': 'benefits' },
})) {
  test(`${language} vacancy headings classify to canonical sections`, () => {
    for (const [heading, expected] of Object.entries(cases)) assert.equal(classifyVacancyHeading(heading), expected, `${heading} should be ${expected}`);
  });
}

test('Romanian headings classify with diacritics intact', () => {
  assert.equal(classifyVacancyHeading('Cerințe'), 'requirements');
  assert.equal(classifyVacancyHeading('Responsabilități'), 'responsibilities');
});

test('every listed heading classifies back to its own section', () => {
  for (const section of VACANCY_SECTIONS) {
    for (const alias of VACANCY_HEADINGS[section]) {
      assert.equal(classifyVacancyHeading(alias), section, `"${alias}" is listed under ${section} but classifies elsewhere`);
    }
  }
});

test('blocks keep offsets into the original text', () => {
  const text = 'Requirements\n- Vue\n- Docker\n';
  for (const block of parseVacancyBlocks(text)) {
    assert.ok(text.slice(block.start, block.end).includes(block.text), `${block.text} should be findable at its own offsets`);
  }
});

test('a key-value block splits its label from its value', () => {
  const [block] = parseVacancyBlocks('Requirements: Vue and TypeScript');
  assert.equal(block.type, 'key-value');
  assert.equal(block.label, 'Requirements');
  assert.equal(block.value, 'Vue and TypeScript');
  assert.equal(block.section, 'requirements', 'the label names the section even though the block carries a value');
});

test('a long bullet list under Requirements is no longer truncated', () => {
  // The old fixed count stopped propagating after eight segments, so the tail
  // of a long requirements list silently became context.
  const skills = ['Vue', 'TypeScript', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'GraphQL', 'Terraform', 'Ansible', 'Kafka', 'Rust', 'Go'];
  const text = ['Requirements', ...skills.map(skill => `- ${skill}`)].join('\n');
  const buckets = bucketVacancyText(text);
  for (const skill of skills) assert.match(buckets.required, new RegExp(skill), `${skill} should be a requirement`);
});

test('a requirements heading stops at the next heading', () => {
  const text = ['Requirements', '- Vue', 'What we offer', '- Free lunch', '- Gym membership'].join('\n');
  const buckets = bucketVacancyText(text);
  assert.match(buckets.required, /Vue/);
  assert.doesNotMatch(buckets.required, /lunch|Gym/, 'benefits must not leak into requirements');
});

test('prose under a heading stays bounded', () => {
  const filler = Array.from({ length: 12 }, (_, index) => `Sentence number ${index} about the team.`);
  const buckets = bucketVacancyText(['Requirements', ...filler].join('\n'));
  assert.doesNotMatch(buckets.required, /number 11/, 'a requirements heading must not swallow the whole posting');
});

test('noise closes an open requirements scope', () => {
  const buckets = bucketVacancyText(['Requirements', '- Vue', 'Equal opportunity employer', '- We value diversity'].join('\n'));
  assert.match(buckets.noise, /Equal opportunity/);
  assert.doesNotMatch(buckets.required, /diversity/);
});

test('the established bucketing contract is unchanged', () => {
  const result = bucketVacancyText('Requirements: Vue and TypeScript. 5 years experience. Nice to have: GraphQL. Benefits: health insurance. Equal opportunity employer.');
  assert.match(result.required, /Vue and TypeScript/i);
  assert.match(result.optional, /GraphQL/i);
  assert.doesNotMatch(result.required, /health insurance/i);
  assert.match(result.noise, /Equal opportunity/i);
});

test('empty input produces no blocks and empty buckets', () => {
  assert.deepEqual(parseVacancyBlocks(''), []);
  assert.deepEqual(parseVacancyBlocks(null), []);
  const buckets = bucketVacancyText('');
  assert.deepEqual([buckets.required, buckets.optional, buckets.context, buckets.noise], ['', '', '', '']);
});

test('a Russian vacancy buckets through its own headings', () => {
  const buckets = bucketVacancyText(['Требования', '- Vue', '- Docker', 'Что мы предлагаем', '- Печеньки'].join('\n'));
  assert.match(buckets.required, /Vue/);
  assert.match(buckets.required, /Docker/);
  assert.doesNotMatch(buckets.required, /Печеньки/);
});
