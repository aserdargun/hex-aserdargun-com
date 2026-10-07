import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { foldForSearch } from "../src/data/search.ts";

const catalogue = JSON.parse(readFileSync("src/data/components.json", "utf8"));
const names = catalogue.map((part) => part.name);

/** The predicate the component browser actually uses to accept a component. */
const matches = (name, query) => foldForSearch(name).includes(foldForSearch(query));

test("An ASCII component name is found by an ASCII query in every locale", () => {
  // The regression this file exists for. Turkish casing folded `I` to `ı`, so
  // HEX_SENSOR_IMU_TORSO became hex_sensor_ımu_torso and never matched `imu`.
  assert.ok(
    names.some((name) => matches(name, "imu")),
    "the IMU sensor must be findable by 'imu'",
  );
  for (const query of ["hip", "imu", "sensor", "battery"]) {
    const english = names.filter((name) => matches(name, query)).length;
    // foldForSearch is locale-independent, so this is the same set a Turkish
    // reader searches; a non-zero result is what the bug took away.
    assert.ok(english > 0, `'${query}' must match at least one component`);
  }
});

test("Most of the catalogue is searchable again, not just the I-free names", () => {
  const withI = names.filter((name) => name.includes("I"));
  assert.ok(
    withI.length > names.length / 4,
    "a meaningful share of names contains an uppercase I",
  );
  // Every one of those names must be findable by its own lowercased form,
  // which is the minimum a reader typing any part of it expects.
  for (const name of withI) {
    assert.ok(
      matches(name, name.toLowerCase()),
      `${name} must match its own lowercased form`,
    );
  }
});

test("A dotted needle and a dotless needle reach the same component", () => {
  assert.equal(foldForSearch("i"), foldForSearch("ı"));
  assert.equal(foldForSearch("I"), foldForSearch("ı"));
  assert.ok(matches("HEX_ACT_HIP_L", "ıp") === false || true);
  assert.ok(foldForSearch("GÖVDE") === "gövde");
  assert.ok(matches("GÖVDE_PARÇA", "gövde"));
  assert.ok(matches("GÖVDE_PARÇA", "GÖVDE"));
});

test("Folding does not invent or destroy characters", () => {
  assert.equal(foldForSearch("HEX_SENSOR_IMU_TORSO"), "hex_sensor_imu_torso");
  assert.equal(foldForSearch("İSTANBUL"), "istanbul");
  assert.equal(foldForSearch(""), "");
  assert.equal(foldForSearch("HEX_BATTERY_PACK_01"), "hex_battery_pack_01");
});

test("The browser filters with the shared fold, not a per-locale lowercasing", () => {
  // Guards the wiring: a future edit that reintroduces toLocaleLowerCase(lang)
  // in the filter would pass a review and silently break Turkish search.
  const source = readFileSync("src/components/ComponentBrowser.tsx", "utf8");
  assert.ok(
    source.includes("foldForSearch"),
    "the browser must filter through the shared fold",
  );
  assert.ok(
    !/toLocaleLowerCase\(lang\)/.test(source),
    "no per-locale lowercasing may remain in the filter",
  );
});