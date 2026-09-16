import { normalizeForMatch } from './normalization.js';

/** Structural blocks for vacancy text. The previous bucketing walked flat
 * segments and let a marker like "Requirements:" propagate over a fixed count
 * of following segments. That count truncated long bullet lists and, on prose,
 * leaked across into unrelated text. Blocks carry the document's real shape
 * instead, so a heading's scope ends where the next heading begins. */

export const BLOCK_TYPES = Object.freeze(['heading', 'paragraph', 'bullet', 'key-value', 'table-row']);
export const VACANCY_SECTIONS = Object.freeze(['requirements', 'optional', 'responsibilities', 'benefits', 'about', 'noise']);

/** Multilingual section headings. English, Russian and Ukrainian already had
 * coverage through the marker regexes; Uzbek, Kazakh and Romanian are added
 * here so the same vacancies parse in those languages. */
export const VACANCY_HEADINGS = Object.freeze({
  requirements: ['requirements', 'requirement', 'qualifications', 'minimum qualifications', 'required skills', 'must have', 'must haves', 'who you are', 'what you need', 'what we expect', 'ideal candidate', 'your profile',
    'требования', 'требования к кандидату', 'квалификация', 'обязательные требования', 'что мы ждем', 'кого мы ищем', 'необходимые навыки',
    'вимоги', 'кваліфікація', "обов'язкові вимоги", 'кого ми шукаємо', 'необхідні навички',
    'talablar', 'malaka talablari', 'zarur ko\'nikmalar', 'nomzodga talablar',
    'талаблар', 'малака талаблари', 'номзодга талаблар',
    'талаптар', 'біліктілік талаптары', 'үміткерге талаптар',
    'cerinte', 'cerinte obligatorii', 'calificari', 'profilul tau'],
  optional: ['nice to have', 'nice to haves', 'preferred qualifications', 'preferred skills', 'bonus points', 'bonus', 'a plus', 'would be a plus', 'desirable', 'good to have',
    'будет плюсом', 'желательно', 'преимуществом будет', 'дополнительные навыки', 'приветствуется',
    'буде плюсом', 'бажано', 'перевагою буде', 'додаткові навички',
    'qo\'shimcha talablar', 'afzallik beradi', 'yaxshi bo\'lardi',
    'қўшимча талаблар', 'афзаллик беради',
    'қосымша талаптар', 'артықшылық болады',
    'constituie un avantaj', 'de dorit', 'optional', 'bonus'],
  responsibilities: ['responsibilities', 'what you will do', "what you'll do", 'your role', 'duties', 'the role', 'about the role', 'job description',
    'обязанности', 'должностные обязанности', 'задачи', 'чем предстоит заниматься', 'ваша роль',
    "обов'язки", 'завдання', 'чим займатиметесь', 'ваша роль',
    'vazifalar', 'majburiyatlar', 'ish tavsifi',
    'вазифалар', 'мажбуриятлар', 'иш тавсифи',
    'міндеттер', 'жұмыс сипаттамасы',
    'responsabilitati', 'atributii', 'descrierea postului'],
  benefits: ['benefits', 'perks', 'what we offer', 'we offer', 'compensation', 'salary', 'conditions', 'working conditions',
    'что мы предлагаем', 'мы предлагаем', 'условия', 'условия работы', 'льготы', 'бонусы', 'зарплата',
    'що ми пропонуємо', 'ми пропонуємо', 'умови', 'умови роботи', 'зарплата',
    'biz taklif qilamiz', 'sharoitlar', 'ish sharoitlari', 'imtiyozlar',
    'биз таклиф қиламиз', 'иш шароитлари', 'имтиёзлар',
    'біз ұсынамыз', 'жұмыс жағдайлары', 'жеңілдіктер',
    'ce oferim', 'beneficii', 'conditii', 'conditii de munca'],
  about: ['about us', 'about the company', 'our company', 'who we are', 'company overview',
    'о компании', 'о нас', 'наша компания',
    'про компанію', 'про нас', 'наша компанія',
    'kompaniya haqida', 'biz haqimizda',
    'компания ҳақида', 'биз ҳақимизда',
    'компания туралы', 'біз туралы',
    'despre noi', 'despre companie'],
  noise: ['equal opportunity employer', 'equal opportunity', 'eeo statement', 'diversity and inclusion', 'reasonable accommodation', 'privacy notice', 'candidate privacy', 'background check', 'recruitment process', 'hiring process', 'pay transparency',
    'процесс найма', 'политика конфиденциальности', 'обработка персональных данных',
    'процес найму', 'політика конфіденційності',
    'yollash jarayoni', 'maxfiylik siyosati',
    'жалдау процесі', 'құпиялылық саясаты',
    'politica de confidentialitate', 'procesul de recrutare'],
});

const fold = (value) => normalizeForMatch(value).normalize('NFD').replace(/\p{M}+/gu, '');

const HEADING_TO_SECTION = (() => {
  const map = new Map();
  for (const section of VACANCY_SECTIONS) for (const alias of VACANCY_HEADINGS[section]) {
    const key = fold(alias);
    if (key && !map.has(key)) map.set(key, section);
  }
  return map;
})();

const BULLET_RE = /^[\s]*(?:[•●▪◦·*•‣◦⁃∙]|[-–—](?=\s)|\d{1,2}[.)](?=\s)|[a-z][.)](?=\s))\s*/u;
const TABLE_ROW_RE = /\|.*\||\t.*\t/u;
/** A label short enough to be a field name, followed by a value on the same
 * line. "Requirements: Vue" is key-value; a sentence with a colon is not. */
const KEY_VALUE_RE = /^([^:：\n]{1,48})[:：]\s*(\S.*)$/u;

/** Classifies a line that carries no value of its own. A heading is a short
 * line whose whole text names a section. */
export function classifyVacancyHeading(value) {
  const line = String(value ?? '').trim().replace(/^[\s#*_>|\-=~•·]+|[\s:：.\-=~_*#|]+$/gu, '');
  if (!line || line.length > 64) return null;
  return HEADING_TO_SECTION.get(fold(line)) ?? null;
}

/** Segments keep the original offsets. Bullet glyphs are recorded as block
 * type rather than rewritten, so `start`/`end` still address the source. */
function* segments(text) {
  let lineStart = 0;
  for (const rawLine of text.split('\n')) {
    const lineEnd = lineStart + rawLine.replace(/\r$/, '').length;
    const line = text.slice(lineStart, lineEnd);
    if (line.trim()) {
      // A list item is atomic: sentence-splitting "1. Docker" would tear the
      // marker off its content and leave two paragraphs.
      if (BULLET_RE.test(line)) yield { start: lineStart, end: lineEnd, text: line };
      else {
        // Sentence splitting only inside a line, so a paragraph written on one
        // line still buckets per clause the way it always did.
        let offset = 0;
        for (const part of line.split(/(?<=[.!?;])\s+/u)) {
          const start = lineStart + line.indexOf(part, offset);
          if (part.trim()) yield { start, end: start + part.length, text: part };
          offset = (start - lineStart) + part.length;
        }
      }
    }
    lineStart += rawLine.length + 1;
  }
}

export function parseVacancyBlocks(value) {
  const text = String(value ?? '');
  const blocks = [];
  for (const segment of segments(text)) {
    const trimmed = segment.text.trim();
    const bullet = BULLET_RE.test(segment.text);
    const body = bullet ? segment.text.replace(BULLET_RE, '').trim() : trimmed;
    if (!body) continue;
    const heading = classifyVacancyHeading(body);
    const keyValue = KEY_VALUE_RE.exec(body);
    const labelSection = keyValue ? classifyVacancyHeading(keyValue[1]) : null;
    const type = heading ? 'heading'
      : TABLE_ROW_RE.test(body) ? 'table-row'
        : bullet ? 'bullet'
          : keyValue ? 'key-value' : 'paragraph';
    blocks.push(Object.freeze({
      type,
      ...(heading ?? labelSection ? { section: heading ?? labelSection } : {}),
      start: segment.start, end: segment.end,
      text: body,
      ...(keyValue ? { label: keyValue[1].trim(), value: keyValue[2].trim() } : {}),
    }));
  }
  return Object.freeze(blocks);
}
