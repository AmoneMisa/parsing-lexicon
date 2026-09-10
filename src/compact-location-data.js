import { inflateRaw } from 'pako';

function base64Bytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

/** Decodes generated deflate map-data without changing the synchronous lexicon API. */
export function decodeCompactLocationData(value) {
  return JSON.parse(new TextDecoder().decode(inflateRaw(base64Bytes(value))));
}
