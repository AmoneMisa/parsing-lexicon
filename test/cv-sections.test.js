import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCvSectionHeading, detectCvSections, extractCvSectionText, CV_SECTIONS, CV_SECTION_HEADINGS } from '../src/cv-sections.js';
import { classifyCvSectionHeading as reexported, extractCvSection } from '../src/hiring-requirements.js';

test('the canonical section list is exactly the nine required sections', () => {
  assert.deepEqual([...CV_SECTIONS], ['profile', 'experience', 'projects', 'skills', 'education', 'languages', 'certifications', 'contact', 'additional']);
});

test('English headings keep classifying as they always did', () => {
  assert.equal(classifyCvSectionHeading('Work Experience'), 'experience');
  assert.equal(classifyCvSectionHeading('Professional Experience'), 'experience');
  assert.equal(classifyCvSectionHeading('Employment History'), 'experience');
  assert.equal(classifyCvSectionHeading('Projects'), 'projects');
  assert.equal(classifyCvSectionHeading('Hobbies'), 'projects');
  assert.equal(classifyCvSectionHeading('About me'), 'profile');
  assert.equal(classifyCvSectionHeading('Tech Stack'), 'skills');
  assert.equal(classifyCvSectionHeading('Education'), 'education');
});

test('sections that used to collapse into "other" are now named', () => {
  assert.equal(classifyCvSectionHeading('Languages'), 'languages');
  assert.equal(classifyCvSectionHeading('Contact'), 'contact');
  assert.equal(classifyCvSectionHeading('Additional Information'), 'additional');
  assert.equal(classifyCvSectionHeading('Certifications'), 'certifications');
});

for (const [language, cases] of Object.entries({
  Russian: { 'Опыт работы': 'experience', 'Навыки': 'skills', 'Образование': 'education', 'О себе': 'profile', 'Языки': 'languages', 'Сертификаты': 'certifications', 'Контакты': 'contact', 'Проекты': 'projects', 'Дополнительная информация': 'additional' },
  Ukrainian: { 'Досвід роботи': 'experience', 'Навички': 'skills', 'Освіта': 'education', 'Про себе': 'profile', 'Мови': 'languages', 'Сертифікати': 'certifications', 'Контакти': 'contact', 'Проєкти': 'projects' },
  'Uzbek Latin': { 'Ish tajribasi': 'experience', "Ko'nikmalar": 'skills', "Ta'lim": 'education', 'Loyihalar': 'projects', 'Tillar': 'languages', 'Sertifikatlar': 'certifications', 'Aloqa': 'contact' },
  'Uzbek Cyrillic': { 'Иш тажрибаси': 'experience', 'Кўникмалар': 'skills', 'Таълим': 'education', 'Лойиҳалар': 'projects', 'Тиллар': 'languages', 'Алоқа': 'contact' },
  Kazakh: { 'Жұмыс тәжірибесі': 'experience', 'Білім': 'education', 'Жобалар': 'projects', 'Тілдер': 'languages', 'Сертификаттар': 'certifications', 'Байланыс': 'contact' },
  Romanian: { 'Experienta profesionala': 'experience', 'Competente': 'skills', 'Educatie': 'education', 'Proiecte': 'projects', 'Limbi straine': 'languages', 'Date de contact': 'contact' },
})) {
  test(`${language} headings classify to canonical sections`, () => {
    for (const [heading, expected] of Object.entries(cases)) assert.equal(classifyCvSectionHeading(heading), expected, `${heading} should be ${expected}`);
  });
}

test('Romanian and Kazakh headings classify with their diacritics intact', () => {
  assert.equal(classifyCvSectionHeading('Experiență profesională'), 'experience');
  assert.equal(classifyCvSectionHeading('Educație'), 'education');
  assert.equal(classifyCvSectionHeading('Competențe'), 'skills');
});

test('every listed alias classifies back to its own section', () => {
  // The diacritic fold is load-bearing: if it ever made two sections collide,
  // one language's heading would silently classify as another section. An
  // alias shared between sections shows up here as a mismatch.
  for (const section of CV_SECTIONS) {
    for (const alias of CV_SECTION_HEADINGS[section]) {
      assert.equal(classifyCvSectionHeading(alias), section, `"${alias}" is listed under ${section} but classifies elsewhere`);
    }
  }
});

test('the heading lexicon covers every canonical section in every language', () => {
  for (const section of CV_SECTIONS) assert.ok(CV_SECTION_HEADINGS[section]?.length >= 6, `${section} needs aliases across the supported languages`);
});

test('decoration, colons and case do not stop a heading from matching', () => {
  for (const heading of ['SKILLS', 'Skills:', '## Skills', '**Skills**', '— Skills —', 'Skills ---', '  skills  ']) {
    assert.equal(classifyCvSectionHeading(heading), 'skills', `${heading} should classify`);
  }
});

test('body text is not mistaken for a heading', () => {
  for (const line of ['I have 5 years of experience building APIs.', 'Skills include Docker, Kubernetes and Terraform.', 'Опыт работы в компании составил три года.', '', '   ', 'Senior Backend Engineer at Acme Corp, 2019-2024']) {
    assert.equal(classifyCvSectionHeading(line), null, `${JSON.stringify(line)} must not be a heading`);
  }
});

test('an unrecognized heading-shaped line does not reset the active section', () => {
  assert.equal(classifyCvSectionHeading('Random Heading'), null);
  const text = 'Skills\nDocker\nRandom Heading\nKubernetes\n';
  assert.equal(extractCvSectionText(text, 'skills'), 'Docker\nRandom Heading\nKubernetes');
});

test('sections expose spans, heading text and heading ranges', () => {
  const text = 'John Doe\nSkills\nDocker\n\nEducation\nBSc\n';
  const spans = detectCvSections(text);
  assert.deepEqual(spans.map(span => span.section), ['preamble', 'skills', 'education']);
  const skills = spans[1];
  assert.equal(skills.heading, 'Skills');
  assert.equal(text.slice(skills.headingRange.start, skills.headingRange.end), 'Skills');
  assert.equal(text.slice(skills.contentStart, skills.end), 'Docker\n\n');
  assert.equal(spans[0].heading, null, 'the preamble has no heading');
});

test('section spans cover the whole document without gaps or overlap', () => {
  const text = 'Preamble line\nProfile\nHi\nExperience\nAcme 2020-2024\nSkills\nGo\n';
  const spans = detectCvSections(text);
  assert.equal(spans[0].start, 0);
  assert.equal(spans.at(-1).end, text.length);
  for (let i = 1; i < spans.length; i++) assert.equal(spans[i].start, spans[i - 1].end, 'spans must be contiguous');
});

test('a document with no headings is one preamble span', () => {
  const spans = detectCvSections('Just a paragraph about me.\n');
  assert.equal(spans.length, 1);
  assert.equal(spans[0].section, 'preamble');
  assert.equal(extractCvSectionText('Just a paragraph about me.\n', 'profile'), '', 'no headings means no extractable section');
});

test('empty input yields no spans and no text', () => {
  assert.deepEqual(detectCvSections(''), []);
  assert.deepEqual(detectCvSections(null), []);
  assert.equal(extractCvSectionText('', 'skills'), '');
});

test('a section repeated later in the document is concatenated', () => {
  const text = 'Skills\nGo\nEducation\nBSc\nSkills\nRust\n';
  assert.equal(extractCvSectionText(text, 'skills'), 'Go\nRust');
});

test('offsets survive CRLF line endings', () => {
  const text = 'Skills\r\nDocker\r\nEducation\r\nBSc\r\n';
  const spans = detectCvSections(text);
  assert.deepEqual(spans.map(span => span.section), ['skills', 'education']);
  assert.equal(text.slice(spans[0].headingRange.start, spans[0].headingRange.end), 'Skills');
  assert.equal(extractCvSectionText(text, 'skills'), 'Docker');
});

test('a mixed-language CV resolves every section it declares', () => {
  const text = ['Профиль', 'Backend-разработчик', 'Ish tajribasi', 'Acme, 2020-2024', 'Білім', 'KBTU, BSc', 'Limbi straine', 'Romana, Engleza'].join('\n');
  assert.deepEqual(detectCvSections(text).map(span => span.section), ['profile', 'experience', 'education', 'languages']);
});

test('the historical import path still resolves to the same classifier', () => {
  assert.equal(reexported, classifyCvSectionHeading);
  assert.equal(extractCvSection('Work Experience\nAcme\nSkills\nVue\n', 'experience'), 'Acme');
});
