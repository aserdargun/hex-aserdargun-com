import test from "node:test";
import assert from "node:assert/strict";
import * as content from "../src/data/content.ts";

// Every user-facing string on this lab is a `Bi` pair rendered through t(),
// which takes index 0 for English and index 1 for Turkish. The content
// contract already proves each pair is complete — two non-empty strings — but
// completeness says nothing about order. A pair written the wrong way round
// still has two non-empty strings, still renders, still passes every existing
// test, and shows a Turkish sentence to an English reader.
//
// Turkish letters that do not occur in English make the mistake detectable
// without guessing: ç ğ ı İ ş ö ü. The check is deliberately one-directional,
// because a short Turkish phrase can be written without any of them while an
// English sentence containing one of them would be a genuine error. The real
// corpus has no false positives today, which is what makes this usable as a
// gate rather than as a heuristic that cries wolf.

const TURKISH_ONLY = /[çğıİşöüÇĞŞÖÜ]/;

/** Every [string, string] pair reachable from the module, with its path. */
const pairs = (() => {
  const found = [];
  const walk = (value, path) => {
    if (Array.isArray(value)) {
      if (
        value.length === 2 &&
        value.every((entry) => typeof entry === "string")
      ) {
        found.push({ path, pair: value });
        return;
      }
      value.forEach((entry, index) => walk(entry, `${path}[${index}]`));
      return;
    }
    if (value && typeof value === "object") {
      for (const key of Object.keys(value)) walk(value[key], `${path}.${key}`);
    }
  };
  for (const key of Object.keys(content)) walk(content[key], key);
  return found;
})();

test("The bilingual corpus is large enough for this gate to matter", () => {
  // A walker that silently finds nothing would pass every assertion below
  // while checking nothing at all, so the surface is counted first.
  assert.ok(pairs.length > 400, `only ${pairs.length} pairs found`);
});

test("No English string carries Turkish-only letters", () => {
  // Asserted on what t() renders, not on the raw array, so this also catches
  // the order being inverted centrally instead of in one authored pair.
  const offenders = pairs
    .map(({ path, pair }) => ({ path, en: content.t(pair, "en"), tr: content.t(pair, "tr") }))
    .filter((row) => TURKISH_ONLY.test(row.en))
    .map((row) => `${row.path}: "${row.en.slice(0, 60)}"`);
  assert.deepEqual(
    offenders,
    [],
    `${offenders.length} string(s) render Turkish in the English slot`,
  );
});

test("Every pair renders a non-empty string in both languages", () => {
  // Structural safety net for any Bi-shaped value that the named-field
  // contract does not enumerate.
  const empty = pairs
    .filter(({ pair }) => !pair.every((entry) => entry.trim().length > 0))
    .map(({ path }) => path);
  assert.deepEqual(empty, [], `${empty.length} pair(s) have an empty side`);
});

test("The two locales never fall back to the same long sentence", () => {
  // Short labels are legitimately identical across languages — acronyms,
  // "HEX", "Actuators"/"Eyleyiciler" are fine, but a whole paragraph copied
  // into both slots is an untranslated stub. Only long strings are considered,
  // where an accidental copy is unambiguous.
  const copied = pairs
    .filter(({ pair }) => pair[0].length >= 120 && pair[0] === pair[1])
    .map(({ path, pair }) => `${path}: "${pair[0].slice(0, 60)}"`);
  assert.deepEqual(copied, [], `${copied.length} long string(s) untranslated`);
});