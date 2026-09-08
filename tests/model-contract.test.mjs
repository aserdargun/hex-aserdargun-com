import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
function readGlb(path) {
  const b = readFileSync(path);
  assert.equal(b.toString("ascii", 0, 4), "glTF");
  assert.equal(b.readUInt32LE(4), 2);
  assert.equal(b.readUInt32LE(8), b.length);
  return JSON.parse(b.toString("utf8", 20, 20 + b.readUInt32LE(12)));
}
const model = readGlb("public/models/HEX_Web.glb");
const nodes = new Map(model.nodes.map((n) => [n.name, n]));
test("Original humanoid has 27 named articulated axes and web annotation anchors", () => {
  assert.equal(
    model.nodes.filter((n) => n.name.startsWith("HEX_PIVOT_")).length,
    27,
  );
  for (const id of [
    "HEX_ROOT",
    "HEX_ANCHOR_HEAD_CAMERA",
    "HEX_ANCHOR_IMU",
    "HEX_ANCHOR_MAIN_COMPUTE",
    "HEX_ANCHOR_BATTERY",
    "HEX_ANCHOR_KNEE_L",
    "HEX_ANCHOR_FOOT_SENSOR_L",
    "HEX_ANCHOR_COM",
  ])
    assert.ok(nodes.has(id), id);
  assert.ok(model.nodes.every((n) => n.name.startsWith("HEX_")));
});
test("Every selectable mesh carries educational metadata and a bounded explosion stage", () => {
  for (const n of model.nodes.filter((n) => n.mesh !== undefined)) {
    assert.ok(n.extras?.category, n.name);
    assert.ok(n.extras?.region, n.name);
    assert.ok(n.extras?.lesson, n.name);
    assert.ok(n.extras.stage >= 1 && n.extras.stage <= 8, n.name);
    if (n.extras.explode) assert.equal(n.extras.explode.length, 3);
  }
});
test("Knee separates a motor, sun, three planets, ring, carrier, bearing, encoder and output", () => {
  for (const id of [
    "ACT",
    "GEAR_SUN",
    "GEAR_RING",
    "GEAR_PLANET",
    "GEAR_CARRIER",
    "BEARING_OUT",
    "ENCODER",
    "OUTPUT",
  ]) {
    assert.ok(
      nodes.has(`HEX_${id}_KNEE_L${id === "GEAR_PLANET" ? "_1" : ""}`),
      id,
    );
  }
  for (let i = 1; i <= 3; i++)
    assert.ok(nodes.has(`HEX_GEAR_PLANET_KNEE_L_${i}`));
});
test("Reusable animations survive GLB export with independent channels", () => {
  const clips = new Map(model.animations.map((a) => [a.name, a]));
  for (const name of [
    "HEX_KNEE_FLEX",
    "HEX_ELBOW_FLEX",
    "HEX_CAMERA_SCAN",
    "HEX_EXPLODE_STRUCTURE",
    "HEX_EXPLODE_ACTUATORS",
    "HEX_EXPLODE_SENSORS",
    "HEX_EXPLODE_POWER",
    "HEX_EXPLODE_COMPUTE",
  ])
    assert.ok(clips.get(name)?.channels.length, name);
  assert.ok(
    clips.get("HEX_EXPLODE_ACTUATORS").channels.length > 20,
    "Explosion moves the actuator map, not one sample part",
  );
  const knee = clips.get("HEX_KNEE_FLEX");
  assert.equal(
    model.nodes[knee.channels[0].target.node].name,
    "HEX_PIVOT_KNEE_L",
  );
});
test("Moving knee output owns the shin and foot downstream hierarchy", () => {
  const knee = nodes.get("HEX_PIVOT_KNEE_L");
  const names = [];
  const walk = (n) => {
    names.push(n.name);
    for (const i of n.children ?? []) walk(model.nodes[i]);
  };
  walk(knee);
  for (const name of [
    "HEX_OUTPUT_KNEE_L",
    "HEX_STRUCTURE_SHIN_L_RAIL_1",
    "HEX_PIVOT_ANKLE_L",
    "HEX_SOLE_L",
  ])
    assert.ok(names.includes(name), name);
  assert.ok(
    !names.includes("HEX_ACT_KNEE_L"),
    "Motor housing remains on the upstream link",
  );
});
test("Web package stays within its documented budget and is self-contained", () => {
  assert.ok(statSync("public/models/HEX_Web.glb").size < 8 * 1024 * 1024);
  assert.ok(model.meshes.length < 600);
  assert.ok((model.buffers ?? []).every((b) => !b.uri));
  assert.ok((model.images ?? []).every((i) => !i.uri));
  assert.deepEqual(
    readFileSync("HEX/export/HEX_Web.glb"),
    readFileSync("public/models/HEX_Web.glb"),
  );
});
