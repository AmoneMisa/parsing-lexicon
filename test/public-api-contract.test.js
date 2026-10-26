import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parseHousingAudience, UA_EXTRA_LOCATION_DICTIONARIES, LOCATION_DICTIONARIES } from '../src/index.js';
import { parseHousingAudience as legacyAudience } from '../src/housing-text.js';
import { parseHousingAudience as enrichedAudience } from '../src/housing-listing-enrichment.js';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const entryPoints = Object.entries(manifest.exports);
const config = ts.readConfigFile(fileURLToPath(new URL('tsconfig.types.json', root)), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, fileURLToPath(root));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();

test('root audience explicitly preserves the scalar contract and the enrichment subpath keeps its structured result', () => {
  assert.equal(parseHousingAudience, legacyAudience);
  assert.equal(parseHousingAudience('для семьи'), 'family');
  assert.deepEqual(enrichedAudience('для студентов'), { primary: 'students', alternatives: ['students'] });
});

test('legacy Ukraine dictionary export references the canonical runtime registry', () => {
  assert.equal(UA_EXTRA_LOCATION_DICTIONARIES, LOCATION_DICTIONARIES.UA);
  assert.ok(UA_EXTRA_LOCATION_DICTIONARIES.Kyiv);
});

test('strict TypeScript consumers and all declarations compile without shims', () => {
  const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
  assert.deepEqual(diagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), []);
});

test('every public entry point has exactly the same value exports in JavaScript and TypeScript', async () => {
  const failures = [];
  for (const [subpath, entry] of entryPoints) {
    assert.equal(typeof entry.types, 'string', `${subpath} needs a declaration entry`);
    const source = program.getSourceFile(fileURLToPath(new URL(entry.types, root)));
    assert.ok(source, `${subpath} declaration must be checked`);
    const symbol = checker.getSymbolAtLocation(source);
    assert.ok(symbol, `${subpath} must declare a module`);
    const declared = checker.getExportsOfModule(symbol).filter(item => {
      const target = item.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(item) : item;
      return target.flags & ts.SymbolFlags.Value;
    }).map(item => item.name).sort();
    const runtime = Object.keys(await import(new URL(entry.import, root))).sort();
    const missingTypes = runtime.filter(name => !declared.includes(name));
    const missingRuntime = declared.filter(name => !runtime.includes(name));
    if (missingTypes.length || missingRuntime.length) failures.push({ subpath, missingTypes, missingRuntime });
  }
  assert.deepEqual(failures, []);
});
