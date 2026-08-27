from pathlib import Path
p = Path('src/housing.js')
s = p.read_text()
old = "  if (flat && findCanonical(text, [flat], { partial: true })) return 'flat';\n  return findCanonical(text, PROPERTY_TYPES, { partial: true })?.canonical || null;"
new = "  if (flat && findCanonical(text, [flat], { partial: true })) return 'flat';\n  const genericUzbekHome = /(?:^|[^\\p{L}\\p{N}_])(?:uy|уй)(?=$|[^\\p{L}\\p{N}_])/iu.test(text);\n  const explicitHouse = /(?:hovli|xovli|ҳовли|ховли|house|casa|dom|villa|будин|коттедж|вілл|вилл|(?:^|[^\\p{L}\\p{N}_])(?:дом|үй)(?=$|[^\\p{L}\\p{N}_]))/iu.test(text);\n  if (genericUzbekHome && !explicitHouse) return null;\n  return findCanonical(text, PROPERTY_TYPES, { partial: true })?.canonical || null;"
if old not in s:
    raise SystemExit('property type resolver anchor not found')
p.write_text(s.replace(old, new, 1))
