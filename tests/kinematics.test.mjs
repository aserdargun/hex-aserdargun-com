import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
async function load() {
  const b = readFileSync("public/models/HEX_Web.glb");
  const g = await new GLTFLoader().parseAsync(
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength),
    "",
  );
  g.scene.updateMatrixWorld(true);
  return g.scene;
}
function center(root, name) {
  const m = root.getObjectByName(name);
  m.geometry.computeBoundingBox();
  return m.localToWorld(m.geometry.boundingBox.getCenter(new Vector3()));
}
test("Positive knee flexion moves the downstream ankle behind the body in glTF coordinates", async () => {
  const root = await load();
  const ankle = root.getObjectByName("HEX_PIVOT_ANKLE_L");
  const before = ankle.getWorldPosition(new Vector3());
  root.getObjectByName("HEX_PIVOT_KNEE_L").rotateX(0.7);
  root.updateMatrixWorld(true);
  const after = ankle.getWorldPosition(new Vector3());
  assert.ok(
    after.z < before.z - 0.1,
    "Front is +Z, knee flexion sends the foot toward −Z",
  );
  assert.ok(after.y > before.y);
});
test("Authored reaching pose places a fingertip next to the target face", async () => {
  const root = await load();
  for (const [id, a] of [
    ["SHOULDER_L", -0.95],
    ["ELBOW_L", -0.42],
    ["WRIST_L", 0.3],
  ])
    root.getObjectByName("HEX_PIVOT_" + id).rotateX(a);
  root.updateMatrixWorld(true);
  const tip = center(root, "HEX_GRIPPER_L_1_B");
  const targetNearFace = new Vector3(0.235, 1.058, 0.674 - 0.115 / 2);
  assert.ok(
    tip.distanceTo(targetNearFace) < 0.018,
    "The authored pose must visually reach its educational target",
  );
});
