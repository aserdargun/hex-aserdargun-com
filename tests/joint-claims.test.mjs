import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { joints, mechanicalModel } from "../src/data/content.ts";

/**
 * The published joint claims describe the Blender-authored model.
 *
 * `AGENTS.md` names the exported .glb "the single source of model truth", and
 * the joints list states, for every selectable joint, how many axes it has and
 * where it sits. Those two things were written by hand: the axis counts were
 * typed into the content and the positions were computed from the asset once.
 * Nothing compared them with the asset, so a re-export that moved a joint or
 * added an axis would leave the laboratory stating a mechanism the model no
 * longer has — with every existing test still green.
 *
 * These checks read the same .glb the laboratory ships and compare it with the
 * published copy, so the copy cannot drift from the model it describes.
 */

async function loadModel() {
  const buffer = readFileSync("public/models/HEX_Web.glb");
  const gltf = await new GLTFLoader().parseAsync(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    "",
  );
  gltf.scene.updateMatrixWorld(true);
  return gltf.scene;
}

/** Every articulated axis in the asset, by name. */
const pivotNames = (root) =>
  root.children
    .flatMap(function walk(node) {
      return [node.name, ...(node.children ?? []).flatMap(walk)];
    })
    .filter((name) => name.startsWith("HEX_PIVOT_"));

/**
 * The axes that belong to one joint.
 *
 * A joint is named by its base and its side: the shoulder is `SHOULDER`, and
 * its axes are `SHOULDER_L`, `SHOULDER_ROLL_L` and `SHOULDER_YAW_L`. The base
 * and side are taken from the joint id rather than from a list, so a joint the
 * content does not publish yet is simply not counted.
 */
const axesOf = (names, jointId) => {
  const [, base, side] = /^([A-Z]+)_([LR])$/.exec(jointId) ?? [];
  if (!base) return [];
  return names.filter(
    (name) =>
      name.startsWith(`HEX_PIVOT_${base}`) && name.endsWith(`_${side}`),
  );
};

/** The number of axes a published sentence claims. */
const claimedAxes = (sentence) => {
  const match = sentence.match(/^(\d+)\s/);
  assert.ok(match, `no axis count in "${sentence}"`);
  return Number(match[1]);
};

test("Every published joint states the number of axes the model has", async () => {
  const root = await loadModel();
  const names = pivotNames(root);
  for (const joint of joints) {
    const axes = axesOf(names, joint.id);
    assert.ok(axes.length > 0, `${joint.id} has no axes in the model`);
    assert.equal(
      claimedAxes(joint.axes[0]),
      axes.length,
      `${joint.id} publishes an axis count the model does not have: ${axes.join(", ")}`,
    );
  }
});

test("Every published joint sits where the model puts it", async () => {
  const root = await loadModel();
  for (const joint of joints) {
    const pivot = root.getObjectByName(`HEX_PIVOT_${joint.id}`);
    assert.ok(pivot, `${joint.id} has no pivot in the model`);
    const world = pivot.getWorldPosition(new Vector3());
    const [x, y, z] = joint.position;
    // The asset stores float32, so the published millimetre-scale precision is
    // what the comparison can honestly expect.
    assert.ok(
      Math.abs(world.x - x) < 1e-3,
      `${joint.id} is published at x=${x} but the model puts it at ${world.x.toFixed(4)}`,
    );
    assert.ok(
      Math.abs(world.y - y) < 1e-3,
      `${joint.id} is published at y=${y} but the model puts it at ${world.y.toFixed(4)}`,
    );
    assert.ok(
      Math.abs(world.z - z) < 1e-3,
      `${joint.id} is published at z=${z} but the model puts it at ${world.z.toFixed(4)}`,
    );
  }
});

test("The model notes state the axis count the model has", async () => {
  const root = await loadModel();
  const names = pivotNames(root);
  for (const locale of [0, 1]) {
    const claimed = mechanicalModel[locale].match(/^(\d+)\s/);
    assert.ok(claimed, `no axis count in the ${locale ? "tr" : "en"} model notes`);
    assert.equal(
      Number(claimed[1]),
      names.length,
      `the model notes claim ${claimed[1]} axes but the model carries ${names.length}`,
    );
  }
});
