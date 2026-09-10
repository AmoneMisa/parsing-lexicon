#!/usr/bin/env node
/** Exports missing OSM name:ru/name:en values for human translation review. */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

function fail(message) { throw new Error(`Map-data translation review: ${message}`); }
function entityExport(country) { return `${country}_MAP_DATA_ENTITIES`; }
function csv(value) {
  const text = String(value ?? '');
  return /[",\r\n]/u.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsv(source) {
  const rows = [];
  let row = []; let value = ''; let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') { row.push(value); value = ''; }
    else if (character === '\n') { row.push(value.replace(/\r$/u, '')); rows.push(row); row = []; value = ''; }
    else value += character;
  }
  if (quoted) fail('approved translation CSV has an unterminated quoted value');
  if (value || row.length) { row.push(value.replace(/\r$/u, '')); rows.push(row); }
  const [header = [], ...body] = rows;
  const columns = new Map(header.map((name, index) => [name.replace(/^\uFEFF/u, ''), index]));
  for (const required of ['country', 'osm', 'translation_russian', 'translation_english']) {
    if (!columns.has(required)) fail(`approved translation CSV is missing ${required}`);
  }
  return body.filter((fields) => fields.some(Boolean)).map((fields) => Object.fromEntries([...columns.entries()].map(([name, index]) => [name, fields[index] || ''])));
}

function approvedTranslations(rows) {
  const translations = new Map();
  for (const row of rows) {
    const russian = row.translation_russian.trim();
    const english = row.translation_english.trim();
    if (!russian && !english) continue;
    for (const osm of row.osm.split(';').map((value) => value.trim()).filter(Boolean)) {
      const key = `${row.country.toUpperCase()}:${osm}`;
      const current = translations.get(key) || { russian: new Set(), english: new Set() };
      if (russian) current.russian.add(russian);
      if (english) current.english.add(english);
      translations.set(key, current);
    }
  }
  return translations;
}

function parseArgs(argv) {
  const options = { country: 'KG' };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]; const value = argv[++index];
    if (!key?.startsWith('--') || !value) fail('expected optional --country, --countries, --geo-source, --cache-dir, --approved-translations and --output');
    if (key === '--country') options.country = value.toUpperCase();
    else if (key === '--countries') options.countries = value.split(',').map((country) => country.trim().toUpperCase()).filter(Boolean);
    else if (key === '--geo-source') options.geoSource = resolve(value);
    else if (key === '--cache-dir') options.cacheDir = resolve(value);
    else if (key === '--approved-translations') options.approvedTranslations = resolve(value);
    else if (key === '--output') options.output = resolve(value);
    else fail(`unknown option ${key}`);
  }
  if (!/^[A-Z]{2}$/.test(options.country)) fail('--country must be an ISO-2 code');
  if (options.countries && (!options.countries.length || options.countries.some((country) => !/^[A-Z]{2}$/.test(country)))) {
    fail('--countries must be a comma-separated list of ISO-2 codes');
  }
  if (options.countries && (options.geoSource || options.output)) fail('--geo-source and --output can only be used with one country');
  return options;
}

const options = parseArgs(process.argv.slice(2));
const root = dirname(fileURLToPath(import.meta.url));
async function reviewRows(countryCode, geoSource) {
  const country = countryCode.toLowerCase();
  const source = geoSource || resolve(root, `../../geo-catalog/data-source/${country}/map-data.js`);
  const geoModule = await import(pathToFileURL(source));
  const entities = geoModule[entityExport(countryCode)];
  if (!Array.isArray(entities)) fail(`geo source must export ${entityExport(countryCode)}`);

  const tagsByOsm = new Map();
  const files = (await readdir(options.cacheDir)).filter((file) => file.startsWith(`${country}-`) && file.endsWith('-map-data.json') && !file.includes('city-report'));
  for (const file of files) {
    const collection = JSON.parse(await readFile(resolve(options.cacheDir, file), 'utf8'));
    for (const feature of collection.features || []) {
      const properties = feature.properties || {};
      if (!properties.osm_type || !properties.osm_id) continue;
      tagsByOsm.set(`${properties.osm_type}:${properties.osm_id}`, properties.tags || {});
    }
  }

  const rows = [];
  for (const entity of entities) {
    const identities = entity.concordances?.osm || [entity.osm];
    const tags = identities.map((osm) => tagsByOsm.get(`${osm.type}:${osm.id}`)).filter(Boolean);
    const sourceNames = entity.sourceNames?.canonical || [entity.canonicalName];
    // The cached PBF extracts retain explicit language tags while available.
    // Generated catalog data retains names but not their tag keys, so fall back
    // to script presence rather than claiming an inferred language is official.
    const russian = [...new Set(tags.map((tag) => tag['name:ru']).filter(Boolean))];
    const english = [...new Set(tags.map((tag) => tag['name:en']).filter(Boolean))];
    const cyrillic = russian.length ? russian : sourceNames.filter((name) => /[А-Яа-яЁё]/u.test(name));
    const latin = english.length ? english : sourceNames.filter((name) => /[A-Za-z]/u.test(name));
    const approved = identities.map((osm) => options.approvedTranslationsByOsm.get(`${countryCode}:${osm.type}:${osm.id}`)).filter(Boolean);
    const approvedRussian = [...new Set(approved.flatMap((translation) => [...translation.russian]))];
    const approvedEnglish = [...new Set(approved.flatMap((translation) => [...translation.english]))];
    const effectiveRussian = [...new Set([...cyrillic, ...approvedRussian])];
    const effectiveEnglish = [...new Set([...latin, ...approvedEnglish])];
    if (effectiveRussian.length && effectiveEnglish.length) continue;
    rows.push({
      country: entity.country,
      city: entity.parentId.split(':')[1],
      type: entity.type,
      canonical: entity.canonicalName,
      osm: identities.map((osm) => `${osm.type}:${osm.id}`).join(';'),
      currentRussian: effectiveRussian.join(' | '),
      currentEnglish: effectiveEnglish.join(' | '),
      needsRussian: effectiveRussian.length ? '' : 'yes',
      needsEnglish: effectiveEnglish.length ? '' : 'yes',
    });
  }
  return rows;
}

options.cacheDir ||= resolve(root, '../../geo-catalog/.cache/geo-enrichment');
options.approvedTranslationsByOsm = options.approvedTranslations
  ? approvedTranslations(parseCsv(await readFile(options.approvedTranslations, 'utf8')))
  : new Map();
const countries = options.countries || [options.country];
const rows = (await Promise.all(countries.map((country) => reviewRows(country, options.geoSource)))).flat();
rows.sort((left, right) => left.city.localeCompare(right.city) || left.type.localeCompare(right.type) || left.canonical.localeCompare(right.canonical));
const columns = ['country', 'city', 'type', 'canonical', 'osm', 'current_russian', 'current_english', 'needs_russian', 'needs_english', 'translation_russian', 'translation_english', 'review_status'];
const content = `\uFEFF${columns.join(',')}\n${rows.map((row) => [row.country, row.city, row.type, row.canonical, row.osm, row.currentRussian, row.currentEnglish, row.needsRussian, row.needsEnglish, '', '', 'pending'].map(csv).join(',')).join('\n')}\n`;
options.output ||= resolve('.cache', 'translation-review', countries.length === 1 ? `${countries[0].toLowerCase()}-map-data-missing-ru-en.csv` : 'approved-map-data-missing-ru-en.csv');
await mkdir(dirname(options.output), { recursive: true });
await writeFile(options.output, content, 'utf8');
console.log(`Wrote ${rows.length} translation-review rows to ${options.output}`);
