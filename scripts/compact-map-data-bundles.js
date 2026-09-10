#!/usr/bin/env node
import { deflateRawSync } from 'node:zlib';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

for (const country of ['kg', 'kz', 'ro', 'ua', 'uz']) {
  const path = resolve(`src/${country}-map-data-location-extensions.js`);
  const module = await import(`${pathToFileURL(path).href}?compact=${Date.now()}`);
  const name = `${country.toUpperCase()}_MAP_DATA_LOCATION_EXTENSIONS`;
  const value = module[name];
  const encoded = deflateRawSync(Buffer.from(JSON.stringify(value), 'utf8'), { level: 9 }).toString('base64');
  const source = `// Generated compact map-data lexical bundle.\nimport { decodeCompactLocationData } from './compact-location-data.js';\nexport const ${name}=Object.freeze(decodeCompactLocationData(${JSON.stringify(encoded)}));\n`;
  await writeFile(path, source);
  console.log(`${country}: ${encoded.length} base64 bytes`);
}
