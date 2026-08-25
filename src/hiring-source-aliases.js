import { aliasesToRegex } from './normalization.js';
import { matchProfessions } from './hiring-professions.js';

const sourceRole = (canonical, label, aliases, group = 'other') => Object.freeze({
  canonical,
  label,
  group,
  aliases: Object.freeze([...new Set(aliases)]),
  re: aliasesToRegex([...new Set(aliases)]),
});

/**
 * Source spellings seen in real CV feeds which are too source-specific or
 * colloquial for the core profession rows. They still live in the shared
 * package so consumers do not grow their own profession regex catalogs.
 */
export const SOURCE_PROFESSION_ALIASES = Object.freeze([
  sourceRole('chief_executive_officer', 'Chief Executive Officer', ['ceo', 'chief executive officer', 'генеральный директор', 'гендиректор', 'виконавчий директор'], 'management'),
  sourceRole('chief_technology_officer', 'Chief Technology Officer', ['cto', 'chief technology officer', 'технический директор', 'технічний директор'], 'management'),
  sourceRole('sales_manager', 'Sales Manager', ['sales executive', 'head of sales', 'менеджер экспортных продаж', 'менеджер по экспортным продажам', 'роп', 'sotuv menejer'], 'sales'),
  sourceRole('driver', 'Driver', ['се категория', 'се категория буйича', 'ce категория', 'ce category', 'shafyor'], 'transport'),
  sourceRole('accountant', 'Accountant', ['bugalteriya', 'buxgalteriya', 'buhgalteriya'], 'finance'),
  sourceRole('cashier', 'Cashier', ['kassa xodimi', 'kassa mudiri'], 'retail'),
  sourceRole('notary', 'Notary', ['notary', 'notarius', 'нотариус'], 'legal'),
  sourceRole('metrology_specialist', 'Metrology Specialist', ['metrologiya', 'metrology specialist', 'метролог', 'standartlashtirish'], 'manufacturing'),
  sourceRole('security_guard', 'Security Guard', ['xavfsizlik', 'qoriqlash', 'qo‘riqlash', "qo'riqlash", 'охорона'], 'security'),
  sourceRole('finance_banking_specialist', 'Finance / Banking Specialist', ['finance specialist', 'banking specialist', 'moliya', 'soliq', 'bank'], 'finance'),
  sourceRole('teacher', 'Teacher', ['tyutorlik', 'тьютор', 'titur', "o'qituvchilik", 'o‘qituvchilik', 'oʻqituvchilik', 'ustoz'], 'education'),
  sourceRole('english_teacher', 'English Teacher', ['ingliz tili ustoziman', 'ingliz tili ustoz', 'ingliz tili oqituvchi', "ingliz tili o'qituvchi"], 'education'),
  sourceRole('it_specialist', 'IT Specialist', ['it specialist', 'itishnik', 'it ishnik', 'kompyuter boyicha ish', "kompyuter bo'yicha ish", 'kompyuter bo‘yicha ish'], 'infrastructure'),
  sourceRole('biotechnologist', 'Biotechnologist', ['biotechnologist', 'биотехнолог', 'biotexnolog'], 'medicine'),
  sourceRole('laboratory_technician', 'Laboratory Technician', ['laborant'], 'medicine'),
  sourceRole('media_specialist', 'Media Specialist', ['media specialist', 'специалист по сми', 'matbuot'], 'media_content'),
  sourceRole('engineer', 'Engineer', ['engineer', 'инженер', 'інженер', 'muhandis', 'injiner'], 'engineering'),
  sourceRole('chat_operator', 'Chat Operator', ['chat operatori'], 'customer_support'),
  sourceRole('call_center_operator', 'Call Center Operator', ['koll-markaz operatori', 'koll markaz operatori', 'call-markaz operatori'], 'customer_support'),
  sourceRole('consultant', 'Consultant', ['consultant', 'консультант', 'консультантка'], 'commercial'),
  sourceRole('supervisor', 'Supervisor', ['supervisor', 'супервайзер', 'начальник отряд', 'начальник отряда'], 'management'),
  sourceRole('quality_inspector', 'Quality Inspector', ['quality inspector', 'инспектор по качеству', 'інспектор з якості'], 'manufacturing'),
  sourceRole('oil_gas_worker', 'Oil & Gas Worker', ['oil and gas', 'oil & gas', 'нефть и газ', 'нефтегаз', 'neft va gaz', 'neft vagaz', 'neft vagaz sohasida', 'neft va gaz sohasida'], 'manufacturing'),
  sourceRole('cybersecurity_specialist', 'Cybersecurity Specialist', ['cybersecurity specialist', 'ciso', 'руководитель по информационной безопасности', 'руководитель информационной безопасности'], 'information_security'),
  sourceRole('architect', 'Architect', ['arxitektor loyihachi', 'arxitektor'], 'construction'),
  sourceRole('economist', 'Economist', ['iqtisodchi', 'iqtsodchi', 'iqtisodiy'], 'finance'),
  sourceRole('logistics_manager', 'Logistics Specialist', ['logist', 'logistics specialist', 'логист'], 'logistics'),
  sourceRole('frontend_developer', 'Frontend Developer', ['frontet', 'frontet developer', 'frontet dasturchi'], 'software_development'),
  sourceRole('nanny', 'Nanny', ['bolalarga qarash', 'bolaga qarash'], 'education'),
  sourceRole('loader', 'Loader', ['грузчиком', 'грузчика', 'грузчик'], 'logistics'),
  sourceRole('welder', 'Welder', ['сварщиком', 'сварщица', 'зварювальником'], 'construction'),
]);

const sourceRoleNormalization = (canonical, label, re) => Object.freeze({ canonical, label, re });

/**
 * Anchored or strongly contextualized raw-role repairs. These rules are kept
 * separate from SOURCE_PROFESSION_ALIASES so generic values such as `model`,
 * `online`, or `bank` never become profession matches in arbitrary CV prose.
 */
export const SOURCE_ROLE_NORMALIZATION_RULES = Object.freeze([
  sourceRoleNormalization('economist', 'Economist', /^iqt(?:i)?sodchi$/iu),
  sourceRoleNormalization('economist', 'Economist', /^iqtisodiy$/iu),
  sourceRoleNormalization('logistics_manager', 'Logistics Specialist', /^logist(?:ika)?(?:\s+updater)?$/iu),
  sourceRoleNormalization('english_teacher', 'English Teacher', /^ingliz\s+tili\s+ustoz(?:iman)?$/iu),
  sourceRoleNormalization('frontend_developer', 'Frontend Developer', /mobilagraf[\s\S]*itishnik[\s\S]*front(?:et|ent|end)/iu),
  sourceRoleNormalization('nanny', 'Nanny', /farqi\s+yo[\s\S]*bolalarga\s+qarash/iu),
  sourceRoleNormalization('sales_manager', 'Sales Manager', /^(?:sales\s+executive(?:\s+ind)?|роп(?:,?\s*sales\s+executive)?)$/iu),
  sourceRoleNormalization('operative_officer', 'Operative Officer', /^(?:оперативник|оперуполномоченн\p{L}*|оперативный\s+уполномоченн\p{L}*)$/iu),
  sourceRoleNormalization('water_supply_specialist', 'Water Supply Specialist', /^(?:suv\s+ta['’ʻʼ‘`]?minoti|водоснабжение)$/iu),
  sourceRoleNormalization('any_role', 'Any Role', /^(?:onlayn(?:\s+ish(?:chi)?)?|online(?:\s+ish(?:chi)?)?|онлайн|удал[её]нно|remote(?:\s+work)?|boshqa\s+ishlar?|farqi\s+(?:yo['’ʻʼ‘`]?q|yuq)|tungi|bilmaym\p{L}*)$/iu),
  sourceRoleNormalization('restaurant_cafe_worker', 'Restaurant / Cafe Worker', /^ищу\s+работу\s+(?:в\s+)?(?:кафе|ресторанах?|кафе\s+или\s+ресторанах)$/iu),
  sourceRoleNormalization('driver', 'Driver', /^(?:xaydovchilik|haydovchilik|shafyorlik|shofyorlik)/iu),
  sourceRoleNormalization('retail_worker', 'Retail Worker', /^do['’ʻʼ‘`]?kon$/iu),
  sourceRoleNormalization('salesperson', 'Salesperson', /^(?:savdo|sotuvchi)$/iu),
  sourceRoleNormalization('pharmacist', 'Pharmacist', /^(?:dorishunos|farmatsevt)$/iu),
  sourceRoleNormalization('notary_assistant', 'Notary Assistant', /^(?:natarus|notarius)\s+yordamchisi/iu),
  sourceRoleNormalization('librarian', 'Librarian', /^kutubxonachi$/iu),
  sourceRoleNormalization('singer_vocalist', 'Singer / Vocalist', /^(?:vokal\s*:\s*)?xonanda$/iu),
  sourceRoleNormalization('model', 'Model', /^model$/iu),
  sourceRoleNormalization('flight_attendant', 'Flight Attendant', /^bortprovodnik$|^бортпроводник$/iu),
  sourceRoleNormalization('hvac_technician', 'HVAC Technician', /^(?:konditsaner|kanditsaner|konditsioner)/iu),
  sourceRoleNormalization('mobile_content_creator', 'Mobile Content Creator', /^mobilografiya(?:\s+bo['’ʻʼ‘`]?yicha)?$/iu),
  sourceRoleNormalization('cctv_intercom_technician', 'CCTV / Intercom Technician', /kamera\s+(?:dama?fon|domofon)|domofon\s+xizmat/iu),
  sourceRoleNormalization('internal_control_specialist', 'Internal Control Specialist', /^ichki\s+nazoratchi$/iu),
  sourceRoleNormalization('brand_ambassador', 'Brand Ambassador', /^(?:бренд\s+фейс|brand\s+face)$/iu),
  sourceRoleNormalization('insurance_specialist', 'Insurance Specialist', /^sug['’ʻʼ‘`]?urta$/iu),
  sourceRoleNormalization('bank_operations_specialist', 'Bank Operations Specialist', /^стаж[её]р\s+операционист|^операционист$/iu),
  sourceRoleNormalization('commercial_director', 'Commercial Director', /^коммерческ\p{L}*\s+директор|\bchief\s+commercial\s+officer\b|\bCCO\b/iu),
  sourceRoleNormalization('security_specialist', 'Security Specialist', /^по\s+безопасност\p{L}*\s+объекта$/iu),
  sourceRoleNormalization('healthcare_specialist', 'Healthcare Specialist', /^mededsina$|^meditsina$|^медицина$/iu),
  sourceRoleNormalization('tourism_hospitality_specialist', 'Tourism / Hospitality Specialist', /^mehmonxona[^\n]*turfirma|^turfirma[^\n]*mehmonxona/iu),
  sourceRoleNormalization('confectioner', 'Confectioner', /qandolat|qandolatchi/iu),
]);

export function normalizeSourceRole(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const match = SOURCE_ROLE_NORMALIZATION_RULES.find((entry) => entry.re.test(text));
  return match ? Object.freeze({ canonical: match.canonical, label: match.label }) : null;
}

export const SOURCE_CANDIDATE_INTENT_ALIASES = Object.freeze([
  'работу ищу',
  'роботу шукаю',
  'срочно работу ищу',
  'терміново роботу шукаю',
  'могу работать',
  'можу працювати',
]);

const SOURCE_CANDIDATE_INTENT_RE = aliasesToRegex(SOURCE_CANDIDATE_INTENT_ALIASES);

export function matchesSourceCandidateIntent(value) {
  return SOURCE_CANDIDATE_INTENT_RE.test(String(value || ''));
}

const LABELS = new Map(SOURCE_PROFESSION_ALIASES.map((entry) => [entry.canonical, entry.label]));
const ACRONYMS = new Map([
  ['qa', 'QA'], ['hr', 'HR'], ['ui', 'UI'], ['ux', 'UX'], ['ai', 'AI'], ['ml', 'ML'],
  ['seo', 'SEO'], ['sre', 'SRE'], ['dba', 'DBA'], ['crm', 'CRM'], ['erp', 'ERP'], ['pmo', 'PMO'], ['it', 'IT'],
]);

export function professionDisplayLabel(canonical) {
  if (!canonical) return '';
  const explicit = LABELS.get(canonical);
  if (explicit) return explicit;
  return String(canonical).split('_').map((part) => ACRONYMS.get(part) || `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(' ');
}

function sourceMatches(text) {
  const matches = [];
  for (const entry of SOURCE_PROFESSION_ALIASES) {
    const match = String(text || '').match(entry.re);
    if (!match) continue;
    matches.push({
      canonical: entry.canonical,
      group: entry.group,
      family: entry.group,
      score: 1,
      strength: 'strong',
      matched: match[0].trim(),
      index: match.index ?? 0,
      label: entry.label,
    });
  }
  return matches;
}

/**
 * Combine the core taxonomy with real-source aliases. More specific matches
 * suppress contained generic matches ("Chief Accountant" must not also become
 * "Accountant"), while separate spans remain separate professions.
 */
export function matchExtendedProfessions(value, { limit = 5, allowWeak = true } = {}) {
  const text = String(value || '');
  if (!text) return [];
  const base = matchProfessions(text, { limit: Math.max(limit * 4, 24), allowWeak }).map((match) => {
    const index = text.toLocaleLowerCase().indexOf(String(match.matched || '').toLocaleLowerCase());
    return { ...match, index: index < 0 ? 0 : index, label: professionDisplayLabel(match.canonical) };
  });
  const matches = [...base, ...sourceMatches(text)]
    .sort((a, b) => b.score - a.score || b.matched.length - a.matched.length || a.index - b.index);

  const selected = [];
  const canonicals = new Set();
  for (const match of matches) {
    if (canonicals.has(match.canonical)) continue;
    const start = match.index;
    const end = start + match.matched.length;
    const contained = selected.some((chosen) => {
      const chosenStart = chosen.index;
      const chosenEnd = chosenStart + chosen.matched.length;
      return chosen.score >= match.score && chosenStart <= start && chosenEnd >= end && chosen.matched.length > match.matched.length;
    });
    if (contained) continue;
    canonicals.add(match.canonical);
    selected.push({ ...match });
  }

  // A concrete software role outranks a generic "IT specialist" mention in
  // the same role/title text, even when the two aliases occupy separate spans.
  const hasSoftwareRole = selected.some((match) => match.group === 'software_development');
  const filtered = hasSoftwareRole
    ? selected.filter((match) => match.canonical !== 'it_specialist')
    : selected;

  return Object.freeze(filtered.slice(0, limit).map((match) => Object.freeze(match)));
}