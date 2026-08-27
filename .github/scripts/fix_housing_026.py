from pathlib import Path

root = Path(__file__).resolve().parents[2]
intent = root / 'src/housing-intent.js'
housing = root / 'src/housing.js'
tests = root / 'test/housing-legacy-semantics.test.js'
pkg = root / 'package.json'

text = intent.read_text()
old = "export function classifyHousingDealType(value) {\n  return resolveHousingIntent(value)?.dealType || null;\n}\n"
new = """export function classifyHousingDealType(value) {
  const resolved = resolveHousingIntent(value)?.dealType;
  if (resolved) return resolved;

  // Some housing feeds omit an explicit rent verb but still use established
  // Uzbek offer/share shorthand. Keep this fallback package-owned so consumers
  // do not carry their own multilingual regexes.
  const text = String(value || '');
  if (!text) return null;
  if (/(?:sherik(?:ka|lik)|шерик(?:ка|лик)|(?:1|bir)\\s+ta\\s+qiz\\s+sherik|(?:1|бир)\\s*та\\s*(?:бола|киши|қиз|киз)\\s*керак|1\\s*хонага[^\\r\\n]{0,40}(?:киши|одам)\\s*турилади|oila(?:ga)?\\s+qo['’`]?yiladi|oila(?:ga)?\\s+quyiladi|(?:хонали|квартир)[^\\r\\n]{0,100}турибди[^\\r\\n]{0,30}\\d+\\s*\\$|квартира\\s+бор)/iu.test(text)) {
    return 'longRent';
  }
  return null;
}
"""
if old not in text:
    raise SystemExit('classifyHousingDealType anchor not found')
intent.write_text(text.replace(old, new))

text = housing.read_text()
old = "ru: ['собственник', 'хозяин', 'от хозяина', 'без посредников'], en: ['owner', 'direct owner', 'no agent'], uk: ['власник', 'власниця', 'від власника', 'без посередників'], ro: ['proprietar', 'direct proprietar', 'fără agenție', 'fara agentie', 'fără intermediari'],\n    uzLatn: ['egasi', 'uy egasi', 'mulkdor', 'maklersiz', 'vositachisiz'], uzCyrl: ['эгаси', 'уй эгаси', 'мулкдор', 'маклерсиз', 'воситачисиз'], kk: ['иесі', 'үй иесі', 'меншік иесі', 'делдалсыз'],"
new = "ru: ['собственник', 'хозяин', 'от хозяина', 'без посредников', 'без посредника', 'без риелтора', 'без риэлтора', 'без маклера', 'без маклер', 'без агента'], en: ['owner', 'direct owner', 'no agent', 'no broker', 'no realtor'], uk: ['власник', 'власниця', 'від власника', 'без посередників'], ro: ['proprietar', 'direct proprietar', 'fără agenție', 'fara agentie', 'fără intermediari'],\n    uzLatn: ['egasi', 'uy egasi', 'mulkdor', 'maklersiz', 'vositachisiz'], uzCyrl: ['эгаси', 'уй эгаси', 'мулкдор', 'маклерсиз', 'воситачисиз', 'без маклер'], kk: ['иесі', 'үй иесі', 'меншік иесі', 'делдалсыз'],"
if old not in text:
    raise SystemExit('seller owner alias anchor not found')
housing.write_text(text.replace(old, new))

text = tests.read_text()
text = text.replace(
"  assert.equal(classifyHousingDealType('Пәтер жалға беріледі'), 'longRent');\n",
"  assert.equal(classifyHousingDealType('Пәтер жалға беріледі'), 'longRent');\n  assert.equal(classifyHousingDealType(\"Uy yangi remontdan chiqqan. Oila qo’yiladi. 500$ Makler 50%\"), 'longRent');\n  assert.equal(classifyHousingDealType('2 хонали 3 этажда ремонти яхши холатда турибди 350$'), 'longRent');\n  assert.equal(classifyHousingDealType('Uch tepa 12-kvartalda 1 ta qiz sherikka olinadi'), 'longRent');\n",
)
text = text.replace(
"  assert.deepEqual(parseHousingPayments('без комиссии').commission, { required: false, percent: null });\n",
"  assert.deepEqual(parseHousingPayments('без комиссии').commission, { required: false, percent: null });\n  assert.notEqual(parseHousingSeller('Квартира ЖК NRG BAXT БЕЗ МАКЛЕР!').type, 'agency');\n  assert.notEqual(parseHousingSeller('Ижара шартнома йук. Без Маклер').type, 'agency');\n",
)
tests.write_text(text)

text = pkg.read_text().replace('"version": "0.2.5"', '"version": "0.2.6"')
pkg.write_text(text)
