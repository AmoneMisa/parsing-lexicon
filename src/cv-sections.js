import { normalizeForMatch } from './normalization.js';

/** Multilingual CV section headings. `classifyCvSectionHeading` keeps its
 * original signature and its original answers for English input; this module
 * widens the heading lexicon and adds spans with provenance on top.
 *
 * Languages: English, Russian, Ukrainian, Uzbek (Latin and Cyrillic), Kazakh
 * and Romanian. Uzbek and Kazakh CVs are routinely written in either script,
 * so both spellings are listed rather than transliterated at runtime. */

export const CV_SECTIONS = Object.freeze(['profile', 'experience', 'projects', 'skills', 'education', 'languages', 'certifications', 'contact', 'additional']);

/** Longest alias wins, so "work experience" never resolves as "work". Aliases
 * are compared after normalizeForMatch, i.e. case- and diacritic-folded. */
export const CV_SECTION_HEADINGS = Object.freeze({
  profile: ['profile', 'professional profile', 'summary', 'professional summary', 'career summary', 'about me', 'about', 'objective', 'career objective', 'personal statement',
    'профиль', 'резюме', 'о себе', 'обо мне', 'краткая информация', 'цель', 'карьерная цель',
    'профіль', 'про себе', 'коротко про себе', 'мета', 'кар\'єрна мета',
    'profil', 'qisqacha', 'qisqacha ma\'lumot', 'men haqimda', 'maqsad', 'shaxsiy ma\'lumot',
    'профиль', 'мен ҳақимда', 'қисқача маълумот', 'мақсад',
    'туралы', 'өзім туралы', 'мақсаты', 'түйіндеме',
    'profil', 'despre mine', 'obiectiv', 'rezumat', 'sumar'],
  experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'career history', 'professional background',
    'опыт', 'опыт работы', 'опыт трудовой деятельности', 'трудовой опыт', 'место работы', 'места работы', 'карьера', 'профессиональный опыт', 'стаж',
    'досвід', 'досвід роботи', 'професійний досвід', 'місце роботи', 'трудовий досвід',
    'tajriba', 'ish tajribasi', 'mehnat faoliyati', 'ish joyi', 'kasbiy tajriba',
    'тажриба', 'иш тажрибаси', 'меҳнат фаолияти', 'иш жойи',
    'тәжірибе', 'жұмыс тәжірибесі', 'еңбек жолы', 'жұмыс орны',
    'experienta', 'experienta profesionala', 'experienta de munca', 'istoric profesional'],
  projects: ['project', 'projects', 'pet projects', 'pet project', 'personal projects', 'side projects', 'selected projects', 'portfolio', 'hobbies',
    'проект', 'проекты', 'проекты и достижения', 'портфолио', 'личные проекты', 'пет-проекты', 'хобби',
    'проєкти', 'проекти', 'портфоліо', 'особисті проєкти', 'хобі',
    'loyihalar', 'loyiha', 'shaxsiy loyihalar', 'portfolio', 'qiziqishlar',
    'лойиҳалар', 'лойиҳа', 'шахсий лойиҳалар', 'қизиқишлар',
    'жобалар', 'жоба', 'жеке жобалар',
    'proiecte', 'proiect', 'proiecte personale', 'portofoliu', 'hobby-uri'],
  skills: ['skills', 'skill', 'technical skills', 'hard skills', 'soft skills', 'key skills', 'core competencies', 'competencies', 'tech stack', 'technologies', 'technology stack', 'stack', 'expertise',
    'навыки', 'навык', 'ключевые навыки', 'профессиональные навыки', 'технические навыки', 'технологии', 'стек', 'стек технологий', 'компетенции', 'знания и навыки',
    'навички', 'ключові навички', 'професійні навички', 'технічні навички', 'технології', 'компетенції',
    'ko\'nikmalar', 'konikmalar', 'malakalar', 'texnik ko\'nikmalar', 'texnologiyalar', 'bilimlar',
    'кўникмалар', 'малакалар', 'техник кўникмалар', 'технологиялар', 'билимлар',
    'дагдылар', 'машиктер', 'техникалык дагдылар', 'технологиялар', 'біліктілік',
    'competente', 'abilitati', 'aptitudini', 'competente tehnice', 'tehnologii'],
  education: ['education', 'academic background', 'academic qualifications', 'qualifications', 'studies', 'degrees',
    'образование', 'учеба', 'обучение', 'высшее образование', 'академическое образование', 'квалификация',
    'освіта', 'навчання', 'вища освіта', 'кваліфікація',
    'ta\'lim', 'talim', 'ma\'lumot', 'oliy ta\'lim', 'o\'qish', 'malaka',
    'таълим', 'олий таълим', 'ўқиш', 'маълумоти',
    'білім', 'білімі', 'оқу', 'жоғары білім',
    'educatie', 'studii', 'formare', 'studii superioare', 'calificari'],
  languages: ['language', 'languages', 'language skills', 'foreign languages', 'spoken languages',
    'язык', 'языки', 'знание языков', 'иностранные языки', 'владение языками',
    'мова', 'мови', 'знання мов', 'іноземні мови', 'володіння мовами',
    'til', 'tillar', 'chet tillari', 'til bilimi', 'tillarni bilish',
    'тил', 'тиллар', 'чет тиллари', 'тил билими',
    'тіл', 'тілдер', 'шет тілдері', 'тіл білімі',
    'limbi', 'limbi straine', 'limba', 'cunostinte lingvistice'],
  certifications: ['certification', 'certifications', 'certificate', 'certificates', 'licenses', 'licences', 'licenses and certifications', 'courses', 'training', 'trainings', 'professional development', 'awards',
    'сертификаты', 'сертификат', 'сертификация', 'курсы', 'обучение и курсы', 'повышение квалификации', 'лицензии', 'награды', 'достижения',
    'сертифікати', 'сертифікат', 'курси', 'підвищення кваліфікації', 'ліцензії', 'нагороди', 'досягнення',
    'sertifikatlar', 'sertifikat', 'kurslar', 'malaka oshirish', 'litsenziyalar', 'mukofotlar', 'yutuqlar',
    'сертификатлар', 'сертификат', 'курслар', 'малака ошириш', 'мукофотлар', 'ютуқлар',
    'сертификаттар', 'сертификат', 'курстар', 'біліктілікті арттыру', 'марапаттар', 'жетістіктер',
    'certificari', 'certificate', 'cursuri', 'licente', 'premii', 'realizari'],
  contact: ['contact', 'contacts', 'contact information', 'contact details', 'personal details', 'personal information', 'details',
    'контакт', 'контакты', 'контактная информация', 'контактные данные', 'личные данные', 'персональные данные',
    'контакти', 'контактна інформація', 'контактні дані', 'особисті дані',
    'kontakt', 'kontaktlar', 'aloqa', 'aloqa ma\'lumotlari', 'shaxsiy ma\'lumotlar',
    'контакт', 'контактлар', 'алоқа', 'алоқа маълумотлари', 'шахсий маълумотлар',
    'байланыс', 'байланыс ақпараты', 'жеке деректер',
    'contact', 'date de contact', 'informatii de contact', 'date personale'],
  additional: ['additional', 'additional information', 'other', 'miscellaneous', 'references', 'interests', 'volunteering', 'publications',
    'дополнительно', 'дополнительная информация', 'прочее', 'рекомендации', 'интересы', 'волонтерство', 'публикации',
    'додатково', 'додаткова інформація', 'інше', 'рекомендації', 'інтереси', 'волонтерство', 'публікації',
    // "qiziqishlar" / "қизиқишлар" cover interests and hobbies with one word;
    // they stay under projects, matching English "hobbies".
    'qo\'shimcha', 'qoshimcha', 'qo\'shimcha ma\'lumot', 'boshqa', 'tavsiyalar', 'nashrlar',
    'қўшимча', 'қўшимча маълумот', 'бошқа', 'тавсиялар', 'нашрлар',
    'қосымша', 'қосымша ақпарат', 'басқа', 'ұсыныстар', 'жарияланымдар',
    'informatii suplimentare', 'suplimentar', 'altele', 'referinte', 'interese', 'publicatii'],
});

/** `normalizeForMatch` folds case but keeps Latin diacritics, so a Romanian CV
 * writing "Educație" would miss the ASCII alias. Fold combining marks on both
 * the alias and the input instead of listing every spelling twice. This also
 * folds Cyrillic breves and diaereses, which is harmless because it applies
 * symmetrically and no two canonical sections collide under it. */
const fold = (value) => normalizeForMatch(value).normalize('NFD').replace(/\p{M}+/gu, '');

const ALIAS_TO_SECTION = (() => {
  const map = new Map();
  for (const section of CV_SECTIONS) for (const alias of CV_SECTION_HEADINGS[section]) {
    const key = fold(alias);
    if (key && !map.has(key)) map.set(key, section);
  }
  return map;
})();

/** A heading line is short, has no sentence punctuation, and may carry a
 * trailing colon or decorative underline. Body text must not match. */
const HEADING_SHAPE_RE = /^[\s#*_>|\-=~•·]*(.{1,48}?)[\s:：.\-=~_*#|]*$/u;

export function classifyCvSectionHeading(value) {
  const line = String(value ?? '').trim();
  if (!line || line.length > 64) return null;
  const captured = HEADING_SHAPE_RE.exec(line)?.[1];
  if (!captured) return null;
  const key = fold(captured);
  if (!key) return null;
  const section = ALIAS_TO_SECTION.get(key);
  if (section) return section;
  // An unrecognized but heading-shaped line is not a section break. Returning
  // null keeps the previous section active instead of silently resetting it.
  return null;
}

/** Section spans over the original text, each recording the heading that
 * introduced it. Text before the first heading is reported as a `preamble`
 * span with no heading, so offsets always cover the whole document. */
export function detectCvSections(value) {
  const text = String(value ?? '');
  const spans = [];
  let active = { section: 'preamble', heading: null, headingRange: null, start: 0, contentStart: 0 };
  let offset = 0;
  for (const raw of text.split('\n')) {
    const lineStart = offset;
    const lineEnd = lineStart + raw.replace(/\r$/, '').length;
    offset += raw.length + 1;
    const section = classifyCvSectionHeading(raw);
    if (!section) continue;
    if (lineStart > active.start) spans.push(Object.freeze({ ...active, end: lineStart }));
    active = { section, heading: raw.trim(), headingRange: Object.freeze({ start: lineStart, end: lineEnd }), start: lineStart, contentStart: Math.min(text.length, lineEnd + 1) };
  }
  spans.push(Object.freeze({ ...active, end: text.length }));
  return Object.freeze(spans.filter((span) => span.section !== 'preamble' || span.end > span.start));
}

/** Concatenated body lines of one canonical section, matching the historical
 * `extractCvSection` contract: empty when the document has no headings. */
export function extractCvSectionText(value, wanted) {
  const text = String(value ?? '');
  const spans = detectCvSections(text);
  if (!spans.some((span) => span.heading)) return '';
  return spans.filter((span) => span.section === wanted)
    .map((span) => text.slice(span.contentStart, span.end).split('\n').map((line) => line.trim()).filter(Boolean).join('\n'))
    .filter(Boolean).join('\n');
}
